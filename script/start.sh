#! /bin/bash
# https://tmuxcheatsheet.com/

session=$(jq .name package.json)
# replace . by _ in session name
session=${session//./_}

tmux has-session -t $session 2>/dev/null

if [ $? != 0 ]; then
  # Start new session with a name and a first window named
  primary_window="editor"
  tmux new-session -d -s $session -n $primary_window
  tmux send-keys -t $session:$primary_window "nvim ." C-m

  server_name="oc"
  tmux new-window -n $server_name
  tmux send-keys -t $session:$server_name 'opencode' C-m

  server_name="up"
  tmux new-window -n $server_name
  tmux send-keys -t $session:$server_name 'sh script/up.sh'

  window="lazydocker"
  tmux new-window -n $window
  tmux send-keys -t $session:$window "lazydocker" C-m

  window="lazysql"
  tmux new-window -n $window
  tmux send-keys -t $session:$window "lazysql" C-m

  window="Cypress"
  tmux new-window -n $window
  tmux send-keys -t $session:$window "yarn cypress open"

  tmux select-window -t $session:$primary_window
fi

tmux attach-session -t $session
