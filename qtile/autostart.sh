#!/bin/bash

xrandr -s 1920x1080
xset r rate 300 100
picom &
spice-vdagent &
/opt/netskope/stagent/stAgentUI &
