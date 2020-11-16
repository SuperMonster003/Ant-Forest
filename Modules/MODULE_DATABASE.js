/**
 * SQLiteDatabase factory with extended properties
 * @example
 * let db = require("./MODULE_DATABASE").create("./ant_forest.db", "ant_forest", [
 *     {name: "name", not_null: true},
 *     {name: "timestamp", type: "integer", primary_key: true},
 *     {name: "collect", type: "integer"},
 *     {name: "help", type: "integer"}
 * ]);
 * db.insert$(["Brian J. Smith", Date.now(), 25, 31]);
 * console.log(db.rawQueryData$("select * from ant_forest"));
 * db.clear$();
 * @since Nov 3, 2020
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

module.exports = {
    /**
     * @typedef {{
     *     name: string,
     *     type?: string,
     *     not_null?: boolean,
     *     primary_key?: boolean,
     *     autoincrement?: boolean,
     * }[]} SQLiteDatabaseFactory$table_columns
     */
    /**
     * @param {string} db_path
     * @param {string} table_name
     * @param {SQLiteDatabaseFactory$table_columns} table_columns
     * @returns {(
     *     {
     *     database_path: string,
     *     table_name: string,
     *     table_columns: SQLiteDatabaseFactory$table_columns,
     *     insert$: function(data: (string|{toString(): string})[]): number,
     *     delete$: function(key: *=, values: *=): number,
     *     update$: function(data: (string|{toString(): string})[], key: *=, values: *=): number,
     *     rawQuery$: function(sql: string): android.database.Cursor,
     *     rawQueryData$: function(sql: string): {}[],
     *     clear$: function(): void
     * } &
     *     android.database.sqlite.SQLiteDatabase
     * )|[]|android.database.Cursor|number}
     */
    create(db_path, table_name, table_columns) {
        files.createWithDirs(db_path);
        let _db = android.database.sqlite.SQLiteDatabase.openOrCreateDatabase(files.path(db_path), null);
        let _init = () => _tableExists() || _db.execSQL(_generateTblCreationSQL());

        _init();

        _db.__proto__ = {
            database_path: db_path,
            table_name: table_name,
            table_columns: table_columns,
            insert$(data) {
                let _cnt_val = new android.content.ContentValues();
                table_columns.forEach((o, i) => {
                    let _v = data[i];
                    _cnt_val.put(o.name, _v === undefined ? "" : _v.toString());
                });
                return _db.insert(table_name, null, _cnt_val);
            },
            delete$(key, values) {
                let _where_clause = typeof key === "undefined" ? null : key;
                let _val = typeof values === "undefined" ? null : values;
                let _where_args = Array.isArray(_val) || _val === null ? _val : [_val];
                return _db.delete(table_name, _where_clause, _where_args);
            },
            update$(data, key, values) {
                let _cnt_val = new android.content.ContentValues();
                table_columns.forEach((o, i) => {
                    let _v = data[i];
                    _cnt_val.put(o.name, _v === undefined ? "" : _v.toString());
                });
                let _where_clause = typeof key === "undefined" ? null : key;
                let _val = typeof values === "undefined" ? null : values;
                let _where_args = Array.isArray(_val) || _val === null ? _val : [_val];
                return _db.update(table_name, _cnt_val, _where_clause, _where_args);
            },
            rawQuery$(s) {
                return _db.rawQuery(s, null);
            },
            rawQueryData$(sql) {
                let _cur = _db.rawQuery(sql, null);
                let _cnt = _cur.getColumnCount();
                _cur.moveToFirst();
                let _ret = [];

                if (_cur.getCount()) {
                    do {
                        let _data = {};
                        for (let i = 0; i < _cnt; i += 1) {
                            let _n = _cur.getColumnName(i);
                            _data[_n] = _cur.getString(i) || "";
                        }
                        _ret.push(_data);
                    } while (_cur.moveToNext());
                }
                _cur.close();
                return _ret;
            },
            clear$() {
                _db.execSQL("drop table " + table_name);
                _init();
            },
        };

        return Object.assign(_db.__proto__, _db);

        // tool function(s) //

        function _tableExists() {
            let _cur = _db.rawQuery(
                "SELECT count(*) FROM sqlite_master " +
                "WHERE type='table' AND name='" + table_name + "'",
                null);
            _cur.moveToFirst();
            let _ret = !!+_cur.getString(0);
            _cur.close();
            return _ret;
        }

        function _generateTblCreationSQL() {
            let _sql = "create table " + table_name + " (";
            table_columns.forEach((o, idx) => {
                let {name, type, not_null, primary_key, autoincrement} = o;
                _sql += idx ? "," : "";
                _sql += name.toString();
                _sql += " " + (type || "text");
                if (primary_key) {
                    _sql += " primary key";
                }
                if (not_null) {
                    _sql += " not null";
                }
                if (autoincrement) {
                    _sql += " autoincrement";
                }
            });
            return _sql + ")";
        }
    },
};