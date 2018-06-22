#!/bin/bash
COMMAND=$(solium -d contracts/ --fix)
# Show warnings and errors
printf '%s\n' "$COMMAND"
$(echo $COMMAND | grep -q "error")
#check if there is any lint detected error
RES=$? 	
if [ "$RES" -eq "0" ]
then
	# error detected
	exit 1
else
	# all good
	exit 0
fi
