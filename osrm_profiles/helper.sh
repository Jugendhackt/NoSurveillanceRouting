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

routed_command="osrm-routed --threads 2 --algorithm mld "${folder}/${filename}.${ext}.osrm""

echo
echo Finished
echo
echo '============================'
echo

case $NSR_DEV in
    1|[yY]|[yY]es|[tT]rue)
      echo "Running osrm-routed"
      $routed_command --port 5001
      ;;
    * )
      echo 'Please use your systemd or whatever to restart osrm-routed'
      echo "The command to use is:"
      echo "${routed_command} --ip 127.0.0.1 --port 5000 --verbosity WARNING"
      ;;

esac

echo
echo '============================'
echo
