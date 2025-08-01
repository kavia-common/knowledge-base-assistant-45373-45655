#!/bin/bash
cd /home/kavia/workspace/code-generation/knowledge-base-assistant-45373-45655/knowledge_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

