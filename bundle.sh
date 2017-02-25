#!/bin/bash

ssh -i ~/Documents/amazon-keys/lambda_bundler_key.pem ec2-user@ec2-54-186-48-241.us-west-2.compute.amazonaws.com '~/archive.sh'
scp -i ~/Documents/amazon-keys/lambda_bundler_key.pem ec2-user@ec2-54-186-48-241.us-west-2.compute.amazonaws.com:~/pizza-button/archive.zip ./bundled.zip
