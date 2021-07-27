from tqdm import tqdm
from bs4 import BeautifulSoup, SoupStrainer
import requests
import json

"""
Run

NSR_DEV=1 ./helper.sh data in xml no-surveillance.lua

before starting this scripty things
"""

osrm_api = 'http://localhost:5001'
in_file = 'data/in.xml'
parser_threshhold = 1000
nearest_number = 100
cameras = []
marked_nodes = []
marked_nodes_file = 'data/surveilled_nodes.txt'

parsed_noses = []

def is_node_start(line):
    return '<node' in line

def is_node_ended(line):
    return '</node' in line or (is_node_start(line) and ' />' in line )

def is_surveillance_node(node):
    for line in node:
        if 'k="man_made" v="surveillance"' in line:
            return True

    return False

def parse_surveillance_node(node):
    part_names = {'uid': 'int', 'id': 'int', 'lat': 'float', 'lon': 'float'}
    header = node[0]
    _parts = header.split(' ')
    parts = {}
    for pn in part_names:
        for p in _parts:
            if p.startswith(f'{pn}=\"'):
                _ps = p.split('"')
                val = _ps[1]
                val_type = part_names[pn]
                if val_type == 'int':
                    val = int(val)
                elif val_type == 'float':
                    val = float(val)

                parts[pn] = val

    return parts

print('Loading data...')

only_nodes = SoupStrainer("node")

try:
    with open(in_file) as fp:
        node = []
        node_startet = False
        node_ongoing = False
        for _line in fp:
            line = str(_line).strip().replace('\n', '')
            if not node_ongoing:
                node_started = is_node_start(line)
                if not node_started:
                    continue

            node.append(line)
            node_ongoing = not is_node_ended(line)

            if not node_ongoing:
                if is_surveillance_node(node):
                    cameras.append(parse_surveillance_node(node))
                node = []

except FileNotFoundError:
    print(f'{in_file} was not found. Please place it there and run again.')
    exit(1)

print('Data loaded')

cameras_csvs = open('data/cameras.csv', 'w')

for camera in tqdm(cameras):
    lat = camera['lat']
    lon = camera['lon']

    cameras_csvs.write(f"{lat},{lon}\n")

cameras_csvs.close()

with open('data/cameras.json', 'w') as fp:
    json.dump(cameras, fp)

#with open(marked_nodes_file, 'w') as fp:
#    fp.write("\n".join([str(i) for i in sorted(marked_nodes)]))
#    fp.write("\n")
