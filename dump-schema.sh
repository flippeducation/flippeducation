#!/bin/bash
mysqldump -dB flippeducation -p | sed 's/ AUTO_INCREMENT=[0-9]*//g' > schema.sql
# https://stackoverflow.com/a/26328331
