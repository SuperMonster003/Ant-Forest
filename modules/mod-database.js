/**
 * SQLiteDatabase factory with extended properties
 * @example
 * let db = require('./mod-database').create([
 *     {name: 'name', not_null: true},
 *     {name: 'timestamp', type: 'integer', primary_key: true},
 *     {name: 'pick', type: 'integer'},
 * ]);
 * db.insert$(['Brian J. Smith', Date.now(), 25, 31]);
 * console.log(db.rawQueryData$('select * from ant_forest'));
 * db.clear$();
 * @since Nov 3, 2020
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

!function () {
    module.exports = {
        /**
         * @typedef {
         *     'numeric'|'integer'|'real'|'text'|'blob'|
         *     'NUMERIC'|'INTEGER'|'REAL'|'TEXT'|'BLOB'
         * } SQLiteDataType
         * @typedef {{
         *     name: string,
         *     type?: SQLiteDataType,
         *     default?: *,
         *     not_null?: boolean,
         *     primary_key?: boolean,
         * }} SQLite$table_column
         * @typedef {SQLite$table_column[]} SQLite$table_columns
         */
        /**
         * @param {SQLite$table_columns} table_columns
         * @param {Object} [options]
         * @param {string} [options.database_path]
         * @param {string} [options.table_name]
         * @param {'union'|'intersection'} [options.alter]
         */
        create(table_columns, options) {
            let _opt = options || {};

            let _table_name = _opt.table_name || 'ant_forest';
            let _alter_type = _opt.alter;
            let _db_path = _opt.database_path
                ? files.path(_opt.database_path)
                : files.getSdcardPath() + '/.local/ant_forest.db';

            files.createWithDirs(_db_path);


            let _db = Object.create(
                android.database.sqlite.SQLiteDatabase.openOrCreateDatabase(_db_path, null)
            );
            let _db_ext = {
                /**
                 * @returns {string}
                 */
                getDatabasePath() {
                    return _db_path;
                },
                /**
                 * @returns {string}
                 */
                getTableName() {
                    return _table_name;
                },
                /**
                 * @returns {{
                 *     name: string,
                 *     type: string,
                 *     not_null?: boolean,
                 *     primary_key?: boolean,
                 * }}
                 */
                getColumns() {
                    // language=SQLite
                    let _sql = 'SELECT sql FROM sqlite_master WHERE type=? AND tbl_name=?';
                    let _q = this.rawQueryData$(_sql, ['table', _table_name]);
                    return _q[0].sql.match(/\((.+(?=\)$))/)[1].split(/,\s*/).map((s) => {
                        let _o = {};
                        [_o.name, _o.type] = s.split(' ');
                        _o.type = (_o.type || 'TEXT').toLowerCase();
                        if (s.match(/not null/i)) {
                            _o.not_null = true;
                        }
                        if (s.match(/primary key/i)) {
                            _o.primary_key = true;
                        }
                        if (s.match(/default /i)) {
                            _o.default = s.match(/default (.+?(?=\s|$))/i)[1];
                        }
                        return _o;
                    });
                },
                /**
                 * @returns {string[]}
                 */
                getColumnNames() {
                    return this.getColumns().map(col => col.name);
                },
                init$: _init,
                /**
                 * Drop and init
                 */
                clear$() {
                    this.drop$();
                    this.init$();
                },
                drop$() {
                    // language=SQLite
                    _db.execSQL('DROP TABLE ' + _table_name);
                },
                /**
                 * @param {*[]} data
                 * @returns {number}
                 */
                insert$(data) {
                    let _cnt_val = new android.content.ContentValues();
                    table_columns.forEach((o, i) => {
                        let _v = data[i] === undefined ? o.default : data[i];
                        isNullish(_v)
                            ? _cnt_val.putNull(o.name)
                            : _cnt_val.put(o.name, _v.toString());
                    });
                    return _db.insert(_table_name, null, _cnt_val);
                },
                /**
                 * @param {string} [key]
                 * @param {string|string[]} [values]
                 * @returns {number}
                 */
                delete$(key, values) {
                    let _where_clause = typeof key === 'undefined' ? null : key;
                    let _val = typeof values === 'undefined' ? null : values;
                    let _where_args = Array.isArray(_val) || _val === null ? _val : [_val];
                    return _db.delete(_table_name, _where_clause, _where_args);
                },
                /**
                 * @param {*[]} data
                 * @param {string} [key]
                 * @param {string|string[]} [values]
                 * @returns {number}
                 */
                update$(data, key, values) {
                    let _cnt_val = new android.content.ContentValues();
                    table_columns.forEach((o, i) => {
                        let _v = data[i] === undefined ? o.default : data[i];
                        isNullish(_v)
                            ? _cnt_val.putNull(o.name)
                            : _cnt_val.put(o.name, _v.toString());
                    });
                    let _where_clause = typeof key === 'undefined' ? null : key;
                    let _val = typeof values === 'undefined' ? null : values;
                    let _where_args = Array.isArray(_val) || _val === null ? _val : [_val];
                    return _db.update(_table_name, _cnt_val, _where_clause, _where_args);
                },
                /**
                 * @param {string} sql
                 * @param {string[]} [selectionArgs]
                 * @returns {android.database.Cursor}
                 */
                rawQuery$(sql, selectionArgs) {
                    return _db.rawQuery(sql, selectionArgs || null);
                },
                /**
                 * @param {string} sql
                 * @param {string[]} [selectionArgs]
                 * @returns {Object.<string,string>[]}
                 */
                rawQueryData$(sql, selectionArgs) {
                    let _cur = _db.rawQuery(sql, selectionArgs || null);
                    let _cnt = _cur.getColumnCount();
                    _cur.moveToFirst();
                    let _ret = [];

                    if (_cur.getCount()) {
                        do {
                            let _data = {};
                            for (let i = 0; i < _cnt; i += 1) {
                                let _n = _cur.getColumnName(i);
                                _data[_n] = _cur.getString(i) || '';
                            }
                            _ret.push(_data);
                        } while (_cur.moveToNext());
                    }
                    _cur.close();
                    return _ret;
                },
                /**
                 * @param {SQLite$table_column|SQLite$table_columns|string|string[]} columns
                 * @returns {boolean}
                 */
                hasColumn(columns) {
                    let _col = Array.isArray(columns) ? columns : [columns];
                    return _col.every(col => ~this.getColumnNames().indexOf(
                        typeof col === 'string' ? col : col.name
                    ));
                },
                /**
                 * @param {SQLite$table_column|SQLite$table_columns|string|string[]} columns
                 */
                addColumn(columns) {
                    let _col = Array.isArray(columns) ? columns : [columns];
                    _col.forEach((col) => {
                        if (typeof col === 'string') {
                            col = {name: col};
                        }
                        if (!this.hasColumn(col)) {
                            let _type = col.type || 'text';
                            let _def = col.default;
                            // language=SQLite
                            _db.execSQL(
                                'ALTER TABLE ' + _table_name + ' ' +
                                'ADD COLUMN ' + col.name + ' ' + _type + ' ' +
                                (isNullish(_def) ? '' : 'DEFAULT ' + _def)
                            );
                        }
                    });
                },
                /**
                 * @param {SQLite$table_column|SQLite$table_columns|string|string[]} columns
                 */
                dropColumn(columns) {
                    let _to_drop_col_names = (Array.isArray(columns) ? columns : [columns])
                        .map(col => typeof col === 'object' ? col.name : col);
                    let _to_keep_col_names = this.getColumnNames().filter((col) => {
                        return !~_to_drop_col_names.indexOf(col);
                    });
                    let _col_names = _to_keep_col_names.join(',');
                    let _bak = _table_name + '_$_bak';
                    // language=SQLite
                    [
                        'CREATE TEMPORARY TABLE ' + _bak + '(' + _col_names + ')',
                        'INSERT INTO ' + _bak + ' SEL' + 'ECT ' + _col_names + ' FROM ' + _table_name,
                        'DROP TABLE ' + _table_name,
                        'CREATE TABLE ' + _table_name + '(' + _col_names + ')',
                        'INSERT INTO ' + _table_name + ' SEL' + 'ECT ' + _col_names + ' FROM ' + _bak,
                        'DROP TABLE ' + _bak,
                    ].forEach(sql => _db.execSQL(sql));
                },
            };

            _init();
            _alter();

            return Object.assign(_db, _db_ext);

            // tool function(s) //

            function _init() {
                _tableExists() || _db.execSQL(_generateTblCreationSQL());
            }

            function _alter() {
                if (typeof _alter_type === 'string') {
                    let _db_col_names = _db_ext.getColumnNames();
                    if (_alter_type === 'union') {
                        let _spare_columns = table_columns.filter((col) => {
                            return !~_db_col_names.indexOf(col.name);
                        });
                        _db_ext.addColumn(_spare_columns);
                    } else if (_alter_type === 'intersection') {
                        let _tb_col_names = table_columns.map(col => col.name);
                        _db_ext.dropColumn([]
                            .concat(_tb_col_names.filter(n => !~_db_col_names.indexOf(n)))
                            .concat(_db_col_names.filter(n => !~_tb_col_names.indexOf(n)))
                        );
                    } else {
                        throw Error('Unknown alter option for mod-database');
                    }
                }
            }

            function _tableExists() {
                // language=SQLite
                let _sql = 'SELECT count(*) FROM sqlite_master WHERE type=? AND name=?';
                let _cur = _db.rawQuery(_sql, ['table', _table_name]);
                _cur.moveToFirst();
                let _ret = !!Number(_cur.getString(0));
                _cur.close();
                return _ret;
            }

            function _generateTblCreationSQL() {
                let _sql = 'CREATE TABLE ' + _table_name + ' (';
                table_columns.forEach((o, idx) => {
                    let {name, type, not_null, primary_key, default: def} = o;
                    _sql += idx ? ',' : '';
                    _sql += name.toString();
                    _sql += ' ' + (type || 'TEXT').toUpperCase();
                    if (primary_key) {
                        _sql += ' PRIMARY KEY';
                    }
                    if (not_null) {
                        _sql += ' NOT NULL';
                    }
                    if (!isNullish(def)) {
                        _sql += ' DEFAULT ' + def;
                    }
                });
                return _sql + ')';
            }
        },
    };

    // tool function(s) //

    function isNullish(o) {
        return o === undefined || o === null;
    }
}();