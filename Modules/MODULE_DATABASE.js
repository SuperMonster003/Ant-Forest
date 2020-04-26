/**
 * @description
 * android.database.sqlite.SQLiteDatabase with several custom internal functions
 *
 * @example
 * let SQLiteDatabaseFactory = require("./MODULE_DATABASE");
 * let db = new SQLiteDatabaseFactory("./Database/ant_forest.db", "ant_forest", [
 *     {name: "name", not_null: true},
 *     {name: "timestamp", type: "integer", primary_key: true},
 *     {name: "collect", type: "integer"},
 *     {name: "help", type: "integer"}
 * ]);
 * db.insertInto(["Brian J. Smith", +new Date(), 25, 31]);
 * console.log(db.rawQryData("select * from ant_forest"));
 * db.clear();
 *
 * @since Apr 16, 2020
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

// FIXME how i wish i could figure out the usage of SimpleCursorAdapter()
module.exports = function SQLiteDatabaseFactory(db_path, tbl_name, tbl_columns) {
    let {SQLiteDatabase: SQLDb} = android.database.sqlite;
    let {ContentValues: CV} = android.content;

    files.createWithDirs(db_path);
    let _db = SQLDb.openOrCreateDatabase(files.path(db_path), null);
    let _init = () => _tableExists() || _db.execSQL(_generateTblCreationSQL());

    _init();

    _db.__proto__ = Object.assign(_db.__proto__ || {}, {
        database_path: db_path,
        table_name: tbl_name,
        table_columns: tbl_columns,
        insertInto: _insertInto,
        rawQry: s => _db.rawQuery(s, null),
        rawQryData: sql => _rawQryData(sql),
        clear: () => {
            db.execSQL("drop table " + tbl_name);
            _init();
        },
    });

    return _db;

    // tool function(s) //

    function _tableExists() {
        let _cur = _db.rawQuery(
            "SELECT count(*) FROM sqlite_master " +
            "WHERE type='table' AND name='" + tbl_name + "'",
            null);
        _cur.moveToFirst();
        let _ret = !!+_cur.getString(0);
        _cur.close();
        return _ret;
    }

    function _generateTblCreationSQL() {
        let _sql = "create table " + tbl_name + " (";
        tbl_columns.forEach((o, idx) => {
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

    function _update() {
        let sql = "update [" + tbl_name + "] set name='XYZ' where name='ABC' and country='CN'";
        _db.execSQL(sql);
    }

    function _delete() {
        let sql = "delete from " + tbl_name + " where name='ABC' and country='CN'";
        _db.execSQL(sql);
    }

    function _insertInto(data) {
        let _cnt_val = new CV();
        tbl_columns.forEach((o, i) => {
            let _v = data[i];
            _cnt_val.put(
                o.name.toString(),
                typeof _v === "undefined" ? "" : _v.toString()
            );
        });
        _db.insert(tbl_name, null, _cnt_val);
    }

    function _rawQryData(sql) {
        let _cur = _db.rawQry(sql);
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
    }
};