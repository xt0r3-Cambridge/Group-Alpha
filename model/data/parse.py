import re

with open('companies', 'rw') as file:
    lines = file.readlines()

    names = []

    for line in lines:
        m = re.search('\d*\. (\w*)')
        if m:
            names.append(f"'{m.group(0)}'")
    
    print(names)