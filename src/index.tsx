import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Table } from './TableFlex/Table';

import cls from './index.scss';

const container = document.getElementById('root');

const rowsInitial = [
    {
        "0": {
            "value": "Текст"
        },
        "1": {
            "value": "Текст"
        },
        "11": {
            "value": "Текст"
        },
        "2": {
            "value": "Текст"
        },
        "id": 1
    },
    {
        "0": {
            "value": "Текст"
        },
        "1": {
            "value": "Текст"
        },
        "11": {
            "value": "Текст"
        },
        "2": {
            "value": "Текст"
        },
        "id": 2
    },
    {
        "0": {
            "value": "Текст"
        },
        "1": {
            "value": "Текст"
        },
        "11": {
            "value": "Текст"
        },
        "2": {
            "value": "Текст"
        },
        "id": 3
    }
];

const columns = [
    {
        "field": "0",
        "headerName": "Header",
        "width": 50,
    },
    {
        "field": "1",
        "headerName": "Header",
        "width": 150,
    },
    {
        "field": "11",
        "headerName": "Header",
        "width": 150,
    },
    {
        "field": "2",
        "headerName": "Header",
        "width": 150,
    }
];

if (!container) {
    throw new Error(
        'Контейнер root не найден. НЕ удалось вмонтировать реакт приложение',
    );
}

const root = createRoot(container);

const RootRouter = () => {
    const {pathname} = useLocation();

    const [cell, setCell] = useState<{ col: string, row: string }>();
    const [rows, setRows] = useState(rowsInitial);
    const [cols, setCols] = useState(columns);

    const handleChangeWidthColl = (col: string, width: number) => {
        setCols((prev) => prev.map((colInner, index) => {
            if (+col === index) {
                return ({
                    ...colInner,
                    width,
                })
            }
            return colInner;
        }))
    };

    const handleChangeHeightRow = (row: string, height: number) => {
        setRows((prev) => prev.map((rowInner, index) => {
            if (+row === index) {
                return ({
                    ...rowInner,
                    height,
                })
            }
            return rowInner;
        }))
    };

    return (
        <div style={{
            width: '1000px',
            height: '100vh',
            background: '#cccccc',
        }}>
            <Table
                columns={cols}
                onSelectCell={(col, row) => setCell({ col, row })}
                onChangeActiveCell={(value) => console.log(value)}
                activeCell={cell}
                hideHeader
                rows={rows}
                onChangeWidthCol={handleChangeWidthColl}
                onChangeHeightRow={handleChangeHeightRow}
                noData="No data"
            />
        </div>
    )
}

const router = createBrowserRouter([
    { path: "*", Component: RootRouter },
]);

root.render(
    <RouterProvider router={router} />,
);
