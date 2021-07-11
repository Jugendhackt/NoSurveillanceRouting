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

print('Loading data...')

only_nodes = SoupStrainer("node")

try:
    with open(in_file) as fp:
        soup = BeautifulSoup(fp, 'xml', parse_only=only_nodes)
except FileNotFoundError:
    print(f'{in_file} was not found. Please place it there and run again.')
    exit(1)

print('Data loaded')

all_nodes = soup.find_all('node', recursive=False)
all_nodes_len = len(all_nodes)
surveilled_nodes = []

print(f'Filtering {all_nodes_len} nodes...')

for n in all_nodes:
    man_made_surveillange = n.find('tag', k='man_made', v='surveillance', recursive=False)
    if man_made_surveillange:
        surveilled_nodes.append(n)

print(f'Found {len(surveilled_nodes)} surveillance nodes.')
print('Updating dataset...')

for node in tqdm(surveilled_nodes):
    lat = node.get('lat')
    lon = node.get('lon')

    camera = {
        'lat': lat,
        'lon': lon,
    }
    cameras.append(camera)

    r = requests.get(f'{osrm_api}/nearest/v1/walking/{lon},{lat}?number={nearest_number}')
    data = r.json()

    for w in data['waypoints']:
        distance = w['distance']
        if distance > parser_threshhold:
            continue

        for _n in [int(wn) for wn in w['nodes'] if wn not in marked_nodes]:
            marked_nodes.append(int(_n))

with open('data/cameras.json', 'w') as fp:
    json.dump(cameras, fp)

with open(marked_nodes_file, 'w') as fp:
    fp.write("\n".join([str(i) for i in sorted(marked_nodes)]))
    fp.write("\n")
