from tqdm import tqdm
from bs4 import BeautifulSoup
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

print('Loading data...')

try:
    with open(in_file) as fp:
        soup = BeautifulSoup(fp, 'xml')
        opensoup = soup.osm
except FileNotFoundError:
    print(f'{in_file} was not found. Please place it there and run again.')
    exit(1)

print('Data loaded')

all_nodes = opensoup.find_all('node', recursive=False)
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

        for _n in [wn for wn in w['nodes'] if wn not in marked_nodes]:
            marked_nodes.append(_n)
            map_node = opensoup.find('node', id=_n, recursive=False)

            if not map_node or _n in surveilled_nodes:
                continue

            if map_node.find('tag', k='is_surveilled', v='yes', recursive=False):
                continue

            surveilled_tag = soup.new_tag('tag', k='is_surveilled', v='yes')
            map_node.append(surveilled_tag)

soup.osm = opensoup

with open('data/cameras.json', 'w') as fp:
    json.dump(cameras, fp)

with open('data/out.xml', 'w') as fp:
    fp.write(str(soup))
