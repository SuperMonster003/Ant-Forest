/**
 * Encapsulated database module based on SQLiteDatabase
 * @example
 * let db = require('./mod-database').create([
 *     {name: 'name', not_null: true},
 *     {name: 'timestamp', type: 'integer', primary_key: true},
 *     {name: 'pick', type: 'integer'},
 * ]);
 * db.insert(['Brian J. Smith', Date.now(), 25]);
 * console.log(db.rawQueryData$('select * from ant_forest'));
 * db.clear();
 * db.close();
 * @since Oct 31, 2021
 * @author SuperMonster003 {@link https://github.com/SuperMonster003}
 */

/* Here, importClass() is not recommended for intelligent code completion in IDE like WebStorm. */
/* The same is true of destructuring assignment syntax (like `let {Uri} = android.net`). */

let {isNullish} = require('./mod-global');

let SQLiteDatabase = android.database.sqlite.SQLiteDatabase;
let ContentValues = android.content.ContentValues;

let SQLiteDBx = function SQLiteDBxConstructor$iiFe() {
    /**
     * @constructor
     * @param {Dbx.ConstructorInfo} info
     */
    let SQLiteDBx = function (info) {
        this.path = (function $iiFe() {
            if (info.path && !files.exists(info.path)) {
                files.createWithDirs(info.path);
            }
            return info.path;
        })();

        this.table_name = info.table_name;
        this.table_columns = info.table_columns;
        this.alter_type = info.alter_type;
        this.database = SQLiteDatabase.openOrCreateDatabase(this.path, null);

        this.createTableIFN();
        this.alterIFN();
    };

    SQLiteDBx.prototype = {
        constructor: SQLiteDBx,
        isOpen() {
            return this.database.isOpen();
        },
        close() {
            return this.database.close();
        },
        /**
         * @param {Dbx.AlterType} type
         */
        alter(type) {
            let _db_col_names = this.getColumnNames();
            if (type === 'union') {
                let _spare_columns = this.table_columns.filter((o) => {
                    return _db_col_names.indexOf(o.name) < 0;
                });
                this.addColumn(_spare_columns);
            } else if (type === 'intersection') {
                let _tb_col_names = this.table_columns.map(o => o.name);
                this.dropColumn([]
                    .concat(_tb_col_names.filter(n => !_db_col_names.includes(n)))
                    .concat(_db_col_names.filter(n => !_tb_col_names.includes(n))));
            } else {
                throw Error('Unknown alter option for mod-database');
            }
        },
        alterIFN() {
            if (typeof this.alter_type === 'string') {
                this.alter(this.alter_type);
            }
        },
        getPath() {
            return this.path;
        },
        getTableName() {
            return this.table_name;
        },
        /**
         * @return {Dbx.TableColumn[]}
         */
        getColumns() {
            // language=SQLite
            let _sql = 'SELECT sql FROM sqlite_master WHERE type=? AND tbl_name=?';
            let _q = this.rawQueryData(_sql, ['table', this.table_name]);
            return _q[0].sql.match(/\((.+(?=\)$))/)[1].split(/,\s*/).map((s) => {
                let _o = {};
                [_o.name, _o.type] = s.split('\x20');
                _o.type = (_o.type || 'text').toLowerCase();
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
         * @return {string[]}
         */
        getColumnNames() {
            return this.getColumns().map(col => col.name);
        },
        /**
         * @param {any[]} data - according to table_columns
         * @return {android.content.ContentValues}
         */
        getContentValues(data) {
            let _cnt_val = new ContentValues();
            this.table_columns.forEach((o, i) => {
                let _v = data[i] !== undefined ? data[i] : o.default;
                isNullish(_v)
                    ? _cnt_val.putNull(o.name)
                    : _cnt_val.put(o.name, _v.toString());
            });
            return _cnt_val;
        },
        /**
         * @param {Dbx.TableColumns} columns
         * @return {boolean}
         */
        hasColumn(columns) {
            let _names = this.getColumnNames();
            let _has = o => _names.indexOf(typeof o === 'object' ? o.name : o) > 0;
            return Array.isArray(columns) ? columns.every(_has) : _has(columns);
        },
        /**
         * @param {Dbx.TableColumns} columns
         */
        addColumn(columns) {
            let _add = (o) => {
                if (typeof o === 'string') {
                    o = {name: o};
                }
                if (!this.hasColumn(o)) {
                    let _type = o.type || 'text';
                    let _def = o.default;
                    // language=SQLite
                    this.database.execSQL(
                        'ALTER TABLE\x20' + this.table_name + '\x20' +
                        'ADD COLUMN\x20' + o.name + '\x20' + _type + '\x20' +
                        (isNullish(_def) ? '' : 'DEFAULT\x20' + _def));
                }
            };
            Array.isArray(columns) ? columns.forEach(_add) : _add(columns);
        },
        /**
         * @param {Dbx.TableColumns} columns
         */
        dropColumn(columns) {
            let _to_drop = (Array.isArray(columns) ? columns : [columns])
                .map(col => typeof col === 'object' ? col.name : col);
            let _to_keep = this.getColumnNames().filter((col) => {
                return _to_drop.indexOf(col) < 0;
            });
            let _col_names = _to_keep.join(',');
            let _table = this.table_name;
            let _table_bak = _table + '_$_bak';
            // language=SQLite
            [
                'CREATE TEMPORARY TABLE\x20' + _table_bak + '(' + _col_names + ')',
                'INSERT INTO\x20' + _table_bak + '\x20SELECT\x20' + _col_names + '\x20FROM\x20' + _table,
                'DROP TABLE\x20' + _table,
                'CREATE TABLE\x20' + _table + '(' + _col_names + ')',
                'INSERT INTO\x20' + _table + '\x20SELECT\x20' + _col_names + '\x20FROM\x20' + _table_bak,
                'DROP TABLE\x20' + _table_bak,
            ].forEach(sql => this.database.execSQL(sql));
        },
        checkTableExists() {
            // language=SQLite
            let _sql = 'SELECT count(*) FROM sqlite_master WHERE type=? AND name=?';
            let _sel_args = ['table', this.table_name];
            let _cur = this.database.rawQuery(_sql, _sel_args);
            _cur.moveToFirst();
            let _ret = _cur.getString(0) > 0;
            _cur.close();
            return _ret;
        },
        createTable() {
            let _sql = 'CREATE TABLE\x20' + this.table_name + ' (';
            this.table_columns.forEach((o, idx) => {
                _sql += idx ? ',' : '';
                _sql += o.name.toString() + '\x20';
                _sql += o.type ? o.type.toUpperCase() : 'TEXT';
                _sql += o.primary_key ? '\x20PRIMARY KEY' : '';
                _sql += o.not_null ? '\x20NOT NULL' : '';
                _sql += isNullish(o.default) ? '' : '\x20DEFAULT\x20' + o.default;
            });
            this.database.execSQL(_sql + ')');
        },
        createTableIFN() {
            !this.checkTableExists() && this.createTable();
        },
        /**
         * @param {any[]} data - according to table_columns
         * @example
         * $$db.insert([String('name'), Date.now(), Number(23)]);
         * @return {number}
         */
        insert(data) {
            let _cnt_val = this.getContentValues(data);
            return this.database.insert(this.table_name, null, _cnt_val);
        },
        /**
         * @param {string} [key]
         * @param {string|string[]} [values]
         * @example
         * $$db.delete('name');
         * $$db.delete('name=?', 'Peter');
         * $$db.delete('number>?', '23');
         * $$db.delete('name=? AND number>?', ['Peter', '23']);
         * @return {number}
         */
        delete(key, values) {
            let _where_clause = key !== undefined ? key : null;
            let _val = values !== undefined ? values : null;
            let _where_args = Array.isArray(_val) || _val === null ? _val : [_val];
            return this.database.delete(this.table_name, _where_clause, _where_args);
        },
        /**
         * @param {any[]} data - according to table_columns
         * @param {string} [key]
         * @param {string|string[]} [values]
         * @return {number}
         */
        update(data, key, values) {
            let _cnt_val = this.getContentValues(data);
            let _where_clause = key !== undefined ? key : null;
            let _val = values !== undefined ? values : null;
            let _where_args = Array.isArray(_val) || _val === null ? _val : [_val];
            return this.database.update(this.table_name, _cnt_val, _where_clause, _where_args);
        },
        drop() {
            // language=SQLite
            this.database.execSQL('DROP TABLE\x20' + this.table_name);
        },
        /**
         * Drop and re-create the table
         */
        clear() {
            this.drop();
            this.createTable();
        },
        /**
         * @param {string} sql
         * @param {string[]} [sel_args] - selection arguments
         * @return {android.database.Cursor}
         */
        rawQuery(sql, sel_args) {
            return this.database.rawQuery(sql, sel_args || null);
        },
        /**
         * @param {string} sql
         * @param {string[]} [sel_args] - selection arguments
         * @return {Object[]}
         */
        rawQueryData(sql, sel_args) {
            let _cur = this.rawQuery(sql, sel_args);
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
    };

    return SQLiteDBx;
}();

let exp = {
    /**
     * @type {Dbx.PresetTableColumn}
     */
    _table_columns: {
        af: [
            {name: 'name', not_null: true},
            {name: 'timestamp', type: 'integer', primary_key: true, default: Date.now()},
            {name: 'pick', type: 'integer', default: 0},
            // TODO...
            // {name: 'rain', type: 'integer', default: 0},
            // {name: 'dblclick', type: 'integer', default: 0},
        ],
    },
    /**
     * @param {Dbx.TableColumn[]|string} o
     * @return {Dbx.TableColumn[]}
     */
    _parseTableColumns(o) {
        let _columns = typeof o === 'string' ? this._table_columns[o] : o;
        if (typeof _columns === 'undefined') {
            throw Error('Invalid table columns for dbx.create()');
        }
        return _columns;
    },
    /**
     * @param {Dbx.Create.Columns} table_columns
     * @param {Dbx.Create.Options} [options]
     */
    create(table_columns, options) {
        let _opt = options || {};

        return new SQLiteDBx({
            table_name: _opt.table_name || 'ant_forest',
            table_columns: this._parseTableColumns(table_columns),
            alter_type: _opt.alter_type,
            path: _opt.database_path
                ? files.path(_opt.database_path)
                : files.join(files.getSdcardPath(), '.local', 'ant_forest.db'),
        });
    },
};

module.exports = {db: exp};