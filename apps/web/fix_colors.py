import os
import re

directories = [
    '/home/uplix/Desktop/UPLIX/tutaly/apps/web/src/app/(dashboard)/seller',
    '/home/uplix/Desktop/UPLIX/tutaly/apps/web/src/app/(public)/shop'
]

replacements = {
    r'rgba\(29,\s*122,\s*58,\s*0\.\d+\)': 'var(--green-10)',
    r'rgba\(45,\s*184,\s*90,\s*0\.\d+\)': 'var(--green-10)',
    r'rgba\(201,\s*162,\s*39,\s*0\.\d+\)': 'var(--gold-10)',
    r'rgba\(204,\s*43,\s*43,\s*0\.\d+\)': 'var(--red-10)',
    r'rgba\(27,\s*79,\s*158,\s*0\.\d+\)': 'var(--blue-10)',
    r'rgba\(255,\s*255,\s*255,\s*0\.\d+\)': 'var(--c-700)',
    r'#2DB85A': 'var(--green)',
    r'#F05050': 'var(--red)',
    r'#fff': 'white',
    r'#FFF': 'white',
    r'#ffffff': 'white',
    r'#FFFFFF': 'white',
    r'\[#fff\]': 'white',
}

for d in directories:
    for root, dirs, files in os.walk(d):
        for f in files:
            if f.endswith('.tsx'):
                filepath = os.path.join(root, f)
                with open(filepath, 'r') as file:
                    content = file.read()
                
                original_content = content
                for pattern, replacement in replacements.items():
                    content = re.sub(pattern, replacement, content)
                
                if content != original_content:
                    with open(filepath, 'w') as file:
                        file.write(content)
                    print(f"Updated {filepath}")
