import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Table } from './TableFlex/Table';

const container = document.getElementById('root');


const MOCK_TABLE = {
    "rows": [
        {
            "0": {
                "value": "Текст"
            },
            "1": {
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
            "2": {
                "value": "Текст"
            },
            "id": 3
        }
    ],
    "columns": [
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
            "field": "2",
            "headerName": "Header",
            "width": 50,
        }
    ]
};

if (!container) {
    throw new Error(
        'Контейнер root не найден. НЕ удалось вмонтировать реакт приложение',
    );
}

const root = createRoot(container);

const RootRouter = () => {
    const {pathname} = useLocation();

    const [cell, setCell] = useState<{ col: string, row: string }>();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname])

    return (
        <Table
            columns={MOCK_TABLE.columns}
            onSelectCell={(col, row) => setCell({ col, row })}
            onChangeActiveCell={(value) => console.log(value)}
            activeCell={cell}
            hideHeader
            rows={MOCK_TABLE.rows}
            noData="No data"
        />
    )
}

const router = createBrowserRouter([
    { path: "*", Component: RootRouter },
]);

root.render(
    <RouterProvider router={router} />,
);
