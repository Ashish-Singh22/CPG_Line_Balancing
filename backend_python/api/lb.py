import pandas as pd
import numpy as np
import math
import re
import copy
from datetime import datetime

def process_lb_file(parsed_data):
    try:
        data = parsed_data
        print("\n✅ Final data dictionary created:\n")
        print(data)

        # ✅ Step 1: Read the Excel file using pandas
        excel_path = data['file_path']
        model_set = set(model['name'] for model in data['models'])

        # Read all sheets into a dictionary
        sheets_dict = pd.read_excel(excel_path, sheet_name=None)

        # ✅ Step 2: Iterate through sheet names and create DataFrames dynamically
        model_dfs = {}  # to store all model dataframes

        for sheet_name, df in sheets_dict.items():
            # Check if sheet name follows the pattern "ModelData_<ModelName>"
            match = re.match(r"ModelData_(.+)", sheet_name)
            if match:
                model_name = match.group(1)
                # Replace invalid chars (like '.') with '_' for valid variable name
                safe_name = model_name.replace('.', '_')
                model_dfs[safe_name] = df
                print(f"✅ Created DataFrame: {safe_name} (from sheet: {sheet_name})")

        # ✅ Step 3: Display all created DataFrames
        print("\nAll created DataFrames:")
        for name, df in model_dfs.items():
            print(f"\n📘 {name} (rows: {len(df)}, columns: {len(df.columns)})")
            print(df.head())

        # Calculate total number of units across all models
        total_model = sum(model['quantity'] for model in data['models'])
        print(f"✅ Total number of units to be done: {total_model}")

        # Calculate times
        total_time = 455 if data["shift"] == "General" else 425
        takt_time = total_time / total_model
        cycle_time = takt_time - 2.2
        noOfStations = data['noOfStations']

        print(f"✅ Cycle Time: {cycle_time:.2f} minutes")
        print(f"✅ Number of Stations: {noOfStations}")

        # Define the line balancing function with proper parameters
        def make_final_result(input_data, cycle_time_param, noOfStations_param, crane_pos_param):
            # --- Step 1: Calculate total_df_time ---
            input_data['Time (in minutes)'] = pd.to_numeric(input_data['Time (in minutes)'], errors='coerce')
            input_data['Crane Required'] = pd.to_numeric(input_data['Crane Required'], errors='coerce')

            # Filter valid tasks (not -1)
            valid_tasks = input_data['Crane Required'] != -1
            total_df_time = input_data.loc[valid_tasks, 'Time (in minutes)'].sum()

            # --- Step 2: Create task_index_dict ---
            task_index_dict = {row['TOTAL Order']: idx for idx, row in input_data.iterrows()}

            # --- Step 3: Update 'Predecessors' column ---
            def replace_predecessors(val):
                if pd.isna(val) or str(val).strip() == "":
                    return {}  # Return empty dict instead of NaN
                else:
                    preds = [p.strip() for p in str(val).split(',')]
                    return {p: task_index_dict.get(p, None) for p in preds if p}

            input_data['Predecessors'] = input_data['Predecessors'].apply(replace_predecessors)

            # --- Step 4: Add columns ---
            input_data['done_or_not'] = False
            input_data['station_placed'] = None

            stations_required = int(np.ceil(total_df_time / cycle_time_param))
            check_done = 1
            count = 1
            curr_stations = max(noOfStations_param, stations_required)

            solution = []

            while check_done and count < 10:
                # Reset for each iteration
                input_data['done_or_not'] = False
                input_data['station_placed'] = None

                crane_pos_list = crane_pos_param.copy()

                # Adjust crane positions if we need more stations
                if curr_stations > noOfStations_param:
                    diff = curr_stations - noOfStations_param
                    # Add crane to new stations at the beginning
                    new_crane_positions = list(range(1, diff + 1))
                    # Shift original crane positions
                    shifted_positions = [pos + diff for pos in crane_pos_list]
                    crane_pos_list = new_crane_positions + shifted_positions

                # Initialize station list
                template = {"crane_aval": 0, "task_order": [], "time_rem": cycle_time_param}
                list_of_dicts = [copy.deepcopy(template) for _ in range(curr_stations)]

                # Mark stations with cranes
                for i in crane_pos_list:
                    if 0 <= i - 1 < len(list_of_dicts):
                        list_of_dicts[i - 1]["crane_aval"] = 1

                # Get crane-required tasks
                crane_req_index = set(input_data.index[input_data['Crane Required'] == 1])

                # Handle tasks that should be skipped (Crane Required == -1)
                skip_tasks = set(input_data.index[input_data['Crane Required'] == -1])
                for i in skip_tasks:
                    input_data.loc[i, 'done_or_not'] = True
                    input_data.loc[i, 'station_placed'] = -1

                in_p = 0

                # ----------------------------
                # Nested helper: make_order()
                # ----------------------------
                def make_order(i):
                    element_dict = {}
                    levels = []
                    old_list = [i]
                    curr_level = 0

                    while len(old_list) > 0 and curr_level <= 100:
                        new_list = []
                        for j in old_list:
                            depend_dict = input_data.loc[j, "Predecessors"]
                            max_done = -1

                            # Handle dependencies
                            if isinstance(depend_dict, dict) and depend_dict:
                                for key, items in depend_dict.items():
                                    if items is not None and items in input_data.index:
                                        if input_data.loc[items, "done_or_not"] == True:
                                            station = input_data.loc[items, "station_placed"]
                                            if station is not None and station != -1:
                                                max_done = max(max_done, station)
                                        else:
                                            if items not in skip_tasks:
                                                new_list.append(items)

                            if j in element_dict:
                                element_dict[j]["level"] = max(element_dict[j]["level"], curr_level)
                                element_dict[j]["after_pos"] = max(element_dict[j]["after_pos"], max_done)
                            else:
                                element_dict[j] = {"level": curr_level, "after_pos": max_done}

                        curr_level += 1
                        old_list = list(set(new_list))  # Remove duplicates

                    # Build levels
                    for p in range(curr_level):
                        levels.append([])

                    for key, value in element_dict.items():
                        levels[value["level"]].append((key, value["after_pos"]))

                    # Sort each level by after_pos
                    for idx in range(len(levels)):
                        levels[idx].sort(key=lambda x: x[1])

                    # Propagate max position constraint
                    prev_max = -1
                    for idx in range(len(levels)):
                        if idx != 0 and levels[idx]:
                            levels[idx] = [(item[0], max(prev_max, item[1])) for item in levels[idx]]
                        if levels[idx]:
                            prev_max = levels[idx][-1][1]

                    return levels

                # ----------------------------
                # Helper: place_the_items_1() - for crane-required tasks
                # ----------------------------
                def place_the_items_1(order_level):
                    nonlocal in_p
                    for level in order_level:
                        for item in level:
                            task_idx = item[0]
                            min_station = item[1]

                            if input_data.loc[task_idx, "done_or_not"]:
                                continue

                            task_time = input_data.loc[task_idx, "Time (in minutes)"]
                            needs_crane = input_data.loc[task_idx, "Crane Required"] == 1

                            final_pos = max(min_station, in_p) if min_station >= 0 else in_p
                            placed = False

                            # Try to place in existing stations
                            for w in range(final_pos, len(list_of_dicts)):
                                # Check crane requirement
                                if needs_crane and list_of_dicts[w]["crane_aval"] != 1:
                                    continue

                                # Check time constraint
                                if task_time <= list_of_dicts[w]["time_rem"]:
                                    list_of_dicts[w]["task_order"].append(task_idx)
                                    list_of_dicts[w]["time_rem"] -= task_time
                                    in_p = max(in_p, w)
                                    input_data.loc[task_idx, "done_or_not"] = True
                                    input_data.loc[task_idx, "station_placed"] = w
                                    placed = True
                                    break

                            # If not placed, add new station
                            if not placed:
                                new_station = {"crane_aval": 1 if needs_crane else 0,
                                            "task_order": [task_idx],
                                            "time_rem": cycle_time_param - task_time}
                                list_of_dicts.append(new_station)
                                in_p = len(list_of_dicts) - 1
                                input_data.loc[task_idx, "done_or_not"] = True
                                input_data.loc[task_idx, "station_placed"] = in_p

                # ----------------------------
                # Helper: place_the_items_0() - for non-crane tasks
                # ----------------------------
                def place_the_items_0(order_level):
                    nonlocal in_p
                    for level in order_level:
                        for item in level:
                            task_idx = item[0]
                            min_station = item[1]

                            if input_data.loc[task_idx, "done_or_not"]:
                                continue

                            task_time = input_data.loc[task_idx, "Time (in minutes)"]
                            final_pos = max(min_station, in_p) if min_station >= 0 else in_p
                            placed = False

                            # Try to place in existing stations
                            for w in range(final_pos, len(list_of_dicts)):
                                if task_time <= list_of_dicts[w]["time_rem"]:
                                    list_of_dicts[w]["task_order"].append(task_idx)
                                    list_of_dicts[w]["time_rem"] -= task_time
                                    in_p = max(in_p, w)
                                    input_data.loc[task_idx, "done_or_not"] = True
                                    input_data.loc[task_idx, "station_placed"] = w
                                    placed = True
                                    break

                            # If not placed, add new station
                            if not placed:
                                new_station = {"crane_aval": 0,
                                            "task_order": [task_idx],
                                            "time_rem": cycle_time_param - task_time}
                                list_of_dicts.append(new_station)
                                in_p = len(list_of_dicts) - 1
                                input_data.loc[task_idx, "done_or_not"] = True
                                input_data.loc[task_idx, "station_placed"] = in_p

                # --- Process crane-required tasks first ---
                for i in sorted(crane_req_index):
                    if not input_data.loc[i, "done_or_not"]:
                        order_level = make_order(i)
                        place_the_items_1(order_level)

                # --- Process remaining non-crane tasks ---
                in_p = 0  # Reset position pointer
                for index, row in input_data.iterrows():
                    if row["Crane Required"] == 0 and not row["done_or_not"]:
                        order_level_0 = make_order(index)
                        place_the_items_0(order_level_0)

                # Check convergence
                solution = list_of_dicts
                if curr_stations < len(list_of_dicts):
                    curr_stations = len(list_of_dicts)
                else:
                    check_done = 0

                count += 1

            # Verify all tasks are placed
            unplaced = input_data[(input_data['done_or_not'] == False) & (input_data['Crane Required'] != -1)]
            if len(unplaced) > 0:
                print(f"⚠️ Warning: {len(unplaced)} tasks were not placed:")
                print(unplaced[['TOTAL Order', 'Time (in minutes)', 'Crane Required', 'Predecessors']])

            return solution

        # Generate results for each model
        final_result = {}

        for name, df in model_dfs.items():
            # Pass parameters explicitly instead of using global variables
            result = make_final_result(df.copy(), cycle_time, noOfStations, data['crane_pos'])
            final_result[name] = result

        print("\n✅ Line balancing completed for all models")

        # Post-process to add additional fields
        for model_name, station_list in final_result.items():
            df = model_dfs[model_name]
            total_stations = len(station_list)

            # Get all activities with Crane Required = -1
            activities_before = df[df['Crane Required'] == -1]
            activities_before_list = [
                f"{row['TOTAL Order']} -> {row['Steps']}"
                for idx, row in activities_before.iterrows()
            ]

            for idx, station in enumerate(station_list):
                # Station Number
                if idx < total_stations - noOfStations:
                    station['Station_Number'] = -(total_stations - noOfStations - idx)
                else:
                    station['Station_Number'] = idx - (total_stations - noOfStations) + 1

                # Total Manpower (rounded up)
                station['Total_Manpower'] = math.ceil(
                    sum(df.loc[task_idx, 'Manpower (19)'] for task_idx in station['task_order'])
                )

                # Final Order
                station['Final_Order'] = [
                    f"{df.loc[task_idx, 'TOTAL Order']} -> {df.loc[task_idx, 'Steps']}"
                    for task_idx in station['task_order']
                ]

                # Activity Need to done Before (same for all stations in a model)
                station['Activity Need to done Before'] = activities_before_list

        print("\n✅ Post-processing completed")
        print(final_result)

        return {
            'success': True,
            'data': final_result,
            'metadata': {
                'cycle_time': cycle_time,
                'takt_time': takt_time,
                'total_time': total_time,
                'total_models': total_model,
                'noOfStations': noOfStations
            }
        }

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Error occurred: {str(e)}")
        print(f"Full traceback:\n{error_details}")
        return {
            'success': False,
            'message': str(e),
            'traceback': error_details
        }