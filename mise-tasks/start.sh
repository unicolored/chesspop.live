#! /bin/bash
# https://tmuxcheatsheet.com/

session=$(jq -r .name package.json)
# replace . by _ in session name
session=${session//./_}

tmux has-session -t "$session" 2>/dev/null

if [ $? != 0 ]; then
  primary_window="editor"
  tmux new-session -d -s "$session" -n "$primary_window"
  tmux send-keys -t "$session:$primary_window" "nvim ." C-m

  tmux new-window -n server
  tmux send-keys -t "$session:server" "pnpm run dev" C-m

  tmux new-window -n opencode
  tmux send-keys -t "$session:opencode" "opencode" C-m

  tmux select-window -t "$session:$primary_window"
fi

tmux attach-session -t "$session"
