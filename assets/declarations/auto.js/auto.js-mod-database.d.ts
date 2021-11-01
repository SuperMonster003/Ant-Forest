// Type definitions for Auto.js external module mod-database.js
//
// Project: https://github.com/SuperMonster003/Ant-Forest
// Definitions by: SuperMonster003 <https://github.com/SuperMonster003>
// Definitions: https://github.com/SuperMonster003/Ant-Forest/assets/declarations
// TypeScript Version: 4.3.5
//
// Last modified: Oct 21, 2021

/// <reference path="./auto.js-declarations.d.ts" />

/**
 * @Source %project%/modules/mod-database.js
 */

declare namespace Dbx {
    interface TableColumn {
        name?: string;
        type?: 'numeric' | 'integer' | 'real' | 'text' | 'blob' | 'NUMERIC' | 'INTEGER' | 'REAL' | 'TEXT' | 'BLOB';
        default?: any;
        not_null?: boolean;
        primary_key?: boolean;
    }

    interface ConstructorInfo {
        path?: string;
        table_name?: string;
        table_columns?: Dbx.TableColumn[];
        alter_type?: AlterType;
    }

    namespace Create {
        interface Options {
            database_path?: string;
            table_name?: string;
            alter_type?: AlterType;
        }

        type Columns = TableColumn[] | keyof PresetTableColumn;
    }

    interface PresetTableColumn {
        af: TableColumn[];
    }

    type AlterType = 'union' | 'intersection';

    type TableColumns = TableColumn | TableColumn[] | string | string[];
}

declare type SQLiteDatabase$ = android.database.sqlite.SQLiteDatabase;