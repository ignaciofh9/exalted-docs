import os
import json
import shutil
from urllib.parse import quote

def clear_folder(folder_path):
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path) and not filename.endswith('.py'):
            os.unlink(file_path)
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)
    print(f"Cleared folder: {folder_path}")

def generate_unit_page(unit_name, relative_path):
    content = f"""---
title: {unit_name}
icon: {relative_path}
---

<StatsTable unitName="{unit_name}" />
"""
    return content

def generate_index_page(title, units):
    content = f"""---
title: {title}
---

{' '.join([f'''
<UnitStatsWindow unitName="{unit}">
  ## {unit}
</UnitStatsWindow>

''' for unit in units])}
"""
    return content

def create_url_friendly_filename(name):
    return name.lower().replace(' ', '-')

def create_unit_pages(units):
    script_dir = os.path.dirname(os.path.realpath(__file__))
    units_dir = os.path.join(script_dir, "units")
    os.makedirs(units_dir, exist_ok=True)
    for unit in units:
        url_friendly_name = create_url_friendly_filename(unit)
        filename = f"{url_friendly_name}.mdx"
        relative_path = os.path.join("units", filename).replace("\\", "/")  # Ensure forward slashes
        file_path = os.path.join(units_dir, filename)
        with open(file_path, "w") as f:
            f.write(generate_unit_page(unit, quote(relative_path[:-4])))  # Remove .mdx extension and URL-encode
        print(f"Created page for {unit} in {units_dir}")

def generate_part_meta_json(part, units):
    script_dir = os.path.dirname(os.path.realpath(__file__))
    units_dir = os.path.join(script_dir, "units")
    part_dir = os.path.join(units_dir, f"part_{part}")
    os.makedirs(part_dir, exist_ok=True)

    pages = [f"../{create_url_friendly_filename(unit)}" for unit in units]
    
    meta_data = {
        "title": f"Part {part}",
        "pages": pages
    }
    
    with open(os.path.join(part_dir, "meta.json"), "w") as f:
        json.dump(meta_data, f, indent=2)
    
    # Create index.mdx for the part
    index_content = generate_index_page(f"Part {part} Units", units)
    with open(os.path.join(part_dir, "index.mdx"), "w") as f:
        f.write(index_content)
    
    print(f"Created meta.json and index.mdx for part {part} in {part_dir}")

def generate_main_meta_json():
    script_dir = os.path.dirname(os.path.realpath(__file__))
    units_dir = os.path.join(script_dir, "units")
    
    meta_data = {
        "title": "Units",
        "pages": ["part_1", "part_2", "part_3", "part_4"]
    }
    
    with open(os.path.join(units_dir, "meta.json"), "w") as f:
        json.dump(meta_data, f, indent=2)
    
    print(f"Created main meta.json in {units_dir}")

# Lists of unit names organized by part, in order of appearance
part1_units = [
    "Micaiah", "Edward", "Leonardo", "Nolan", "Laura", "Sothe", "Ilyana", "Aran", "Meg",
    "Volug", "Tauroneo", "Zihark", "Jill", "Fiona", "Tormod", "Muarim", "Vika", "Rafiel",
    "Nailah", "Black Knight"
]

part2_units = [
    "Elincia", "Marcia", "Nealuchi", "Leanne", "Haar", "Nephenee", "Brom", "Heather", "Lucia",
    "Lethe", "Mordecai", "Geoffrey", "Kieran", "Makalov", "Astrid", "Danved", "Calill"
]

part3_units = [
    "Ike", "Soren", "Titania", "Oscar", "Boyd", "Shinon", "Rolf", "Mist", "Gatrie",
    "Mia", "Rhys", "Ulki", "Ranulf", "Lyre", "Kyza", "Reyson", "Janaff", "Tanith", "Sigrun",
    "Tibarn", "Pelleas", "Naesala", "Skrimir"
]

part4_units = [
    "Sanaki", "Ena", "Kurthnaga", "Stefan", "Oliver", "Bastian", "Volke", "Caineghis", "Giffca",
    "Renning", "Lehran"
]

all_units = part1_units + part2_units + part3_units + part4_units

# Clear the units folder
script_dir = os.path.dirname(os.path.realpath(__file__))
units_dir = os.path.join(script_dir, "units")
if os.path.exists(units_dir):
    clear_folder(units_dir)
else:
    os.makedirs(units_dir)

# Create all unit pages in the units directory
create_unit_pages(all_units)

# Generate meta.json for each part
generate_part_meta_json(1, part1_units)
generate_part_meta_json(2, part2_units)
generate_part_meta_json(3, part3_units)
generate_part_meta_json(4, part4_units)

# Generate main meta.json
generate_main_meta_json()

# Create main index.mdx
main_index_content = generate_index_page("All Units", all_units)
with open(os.path.join(units_dir, "index.mdx"), "w") as f:
    f.write(main_index_content)

print(f"Created main index.mdx in {units_dir}")