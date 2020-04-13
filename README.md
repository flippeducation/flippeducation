# flippeducation
Software driving an aggregator website for flipped classroom videos (in beta)

# Installation
You will need [node.js](https://nodejs.org/), npm, and [MariaDB](https://mariadb.com/).

## Database setup
- Start the MariaDB service. On GNU+Linux distributions using systemd, this can usually be done with `sudo systemctl start mariadb`.
- Create the `flippeducation` database by running `sudo mysql -u root < schema.sql` (or `mysql -u root -p < schema.sql` if you have set a password for the MariaDB root account) in the root of this repository.
- Create an account in MariaDB with full permissions on the `flippeducation` database by running the following commands as root (`sudo mysql -u root`, possibly with `-p`):
  + Create an account if you have not already, using `CREATE USER '[username]' IDENTIFIED BY '[password]'`, with `[username]` replaced with your desired username and `[password]` with your desired password.
  + Grant all permissions on the `flippeducation` database to the new account by running `GRANT ALL PRIVILEGES ON flippeducation.* TO '[username]'`.
- Create a file in the root of this repository called `.env` and add to it these two lines, making substitutions as above:
  ```
  DB_USER=[username]
  DB_PASS=[password]
  ```

Now, run `npm start` to start the Web server.

# License
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
