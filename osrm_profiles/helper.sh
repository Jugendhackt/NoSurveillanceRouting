#!/bin/bash

folder=$1
filename=$2
ext=$3
profile=$4

echo "Processing ${folder}/${filename}.${ext} for profile ${profile}"
echo "Extracting..."

osrm-extract -p "${profile}" "${folder}/${filename}.${ext}"

echo "Partitioning"
osrm-partition "${folder}/${filename}.${ext}.osrm"

echo "Customizing"
osrm-customize "${folder}/${filename}.${ext}.osrm"

echo "Running routed server"
osrm-routed --algorithm mld "${folder}/${filename}.${ext}.osrm"
