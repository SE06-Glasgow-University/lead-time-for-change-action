# Usage: Clone repo you wish to commit to. 
# Add script to root of local repo then run script

#!/bin/bash
FILE=data.txt

# Check if data.txt exists already
if [ ! -f "$FILE" ]; then
  touch "$FILE"
fi

# User credentials for git push
echo -n Github Username: " "
read USERNAME
echo -n Github Password: " "
read -s PASSWORD
echo

echo -n Username of repo owner: " "
read OWNER

# Repo to push to e.g. www.github.com/username/repo
echo -n Repo to commit to: " "
read REPO

echo -n How many commits to push?: " "
read COMMITS

for((i=0; i < "$COMMITS"; i++)); do
  # Get current time and update file to commit
  cur_time=$(date +"%T")
  echo "$cur_time" >> "$FILE"
  echo

  # Commit and push
  git add data.txt
  git commit -m "'$cur_time'"
  git push https://"$USERNAME":"$PASSWORD"@github.com/"$OWNER"/"$REPO".git
  
  # Wait for next commit if there are still commits to be made
  if [ ! $(("$COMMITS" - "$i")) -eq 1 ]; then
    # Set time interval to wait for
    interval=$(shuf -i 120-3660 -n 1)
    echo -n waiting for "$interval" seconds before next commit
    sleep "$interval"
  fi
done
