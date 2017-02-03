# s3-folder-watcher
Watch the file size of s3 folders during large uploads

### Setup
1. create an empty dynamodb table to store stats
2. Update the settings.json in the application directory
  ```json
  {
      "AWS_REGION": "us-east-1",
      "AWS_ACCESS_KEY_ID": "XXXXXX",
      "AWS_SECRET_ACCESS_KEY": "XXXXXXXXXXXXXX",
      "AWS_DYNAMO_DB_TABLE": "folder-upload-stats",
      "AWS_S3_BUCKET": "data-archive",
      "AWS_S3_PREFIX": "subfolder/",
      "LOG_LEVEL": "debug",
      "CHECK_INTERVAL": 30
  }
  ```
3. Install dependencies
  ```bash
  npm install
  ```
4. Start the application
  ```bash
  node server.js
  ```
5. Open the browser to watch progress http://localhost:3000
