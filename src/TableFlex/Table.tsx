/* eslint-disable no-nested-ternary */
/* eslint-disable no-use-before-define */
import {
    ReactNode, useCallback, useEffect, useRef,
} from 'react';
import { Skeleton, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { classNames } from '@/shared/classNames/classNames';
import { HStack, VStack } from '@/shared/Stack';

import cls from './Table.module.scss';

export interface Column {
    field: string;
    headerName: string;
    renderCell?: (row: Row) => ReactNode;
    renderHeader?: (name: string) => ReactNode;
    width?: string | number;
}

export interface Cell extends Record<string, string | number | boolean | any> {
    value: string | number;
    isImg: boolean;
    render?: (col: Column, row: Row) => ReactNode;
}

export interface Row
    extends Record<string, string | number | boolean | any | Cell> {
    id: number | string;
    height?: string | number;
}

interface TableProps {
    className?: string;
    columns?: Column[];
    rows?: Row[];
    isLoading?: boolean;
    hideHeader?: boolean;
    noData?: string | ReactNode;
    onSelectCell?: (col: string, row: string) => void;
    onChangeActiveCell?: (value: string) => void;
    activeCell?: { col: string; row: string };
}

const MIN_WIDTH = '60px';
const MIN_HEIGHT = '30px';

const caretOffset = 10;
const minimumResizingWidth = 76;

export const Table = (props: TableProps) => {
    const {
        className,
        columns,
        rows,
        isLoading,
        noData,
        onSelectCell,
        hideHeader,
        activeCell,
        onChangeActiveCell,
    } = props;
    const ref = useRef<HTMLDivElement | null>(null);
    const { t } = useTranslation();

    const changeActiveCell = useCallback(
        (e: MouseEvent) => {
            const data = (e.target as HTMLDivElement).dataset;
            const dataParent = (e.target as HTMLDivElement).parentElement
                ?.dataset;
            if (data.col && data.row) {
                onSelectCell?.(data.col, data.row);
            } else if (dataParent?.col && dataParent?.row) {
                onSelectCell?.(dataParent.col, dataParent.row);
            }
        },
        [onSelectCell],
    );

    useEffect(() => {
        const block = ref.current;
        if (!block) {
            return undefined;
        }
        block.addEventListener('dblclick', changeActiveCell);

        return () => {
            block.removeEventListener('dblclick', changeActiveCell);
        };
    }, [changeActiveCell]);

    // function onMovingStart(e: MouseEvent) {
    //     const { target } = e;
    //     const htmlTarget = target as HTMLTableCellElement;
    //     let tableCell = htmlTarget.closest('th'); // TODO || htmlTarget?.closest('td');

    //     if (tableCell && tableCell.nodeName === 'TD') {
    //         tableCell = getCorrespondingTh(tableCell);
    //     }

    //     const elementRect = tableCell.getBoundingClientRect();

    //     const leftBorderSpacing = mousePosition.current - (elementRect.left || 0);
    //     const rightBorderSpacing = (elementRect.right || 0) - mousePosition.current;

    //     const isNearLeftBorder = leftBorderSpacing > -caretOffset && leftBorderSpacing < caretOffset;
    //     const isNearRightBorder = rightBorderSpacing > -caretOffset && rightBorderSpacing < caretOffset;

    //     if (isNearLeftBorder) {
    //     const previousSibling = tableCell.previousElementSibling as HTMLTableCellElement;

    //     if (previousSibling) {
    //         movingEl.current = previousSibling;
    //     }
    //     }

    //     if (isNearRightBorder) {
    //         movingEl.current = tableCell;
    //     }
    // }

    // useEffect(() => {
    //     // document.addEventListener('mousemove', onCursorWatch, true);
    //     document.addEventListener('mousedown', onMovingStart, true);
    //     // document.addEventListener('mouseup', onStopMoving);

    //     return () => {
    //         document.removeEventListener('mousedown', onMovingStart, true);
    //         // document.removeEventListener('mousemove', onCursorWatch, true);
    //         // document.removeEventListener('mouseup', onStopMoving);
    //     };
    // }, []);

    if (isLoading) {
        return (
            <div className={cls.skeleton}>
                <Skeleton />
            </div>
        );
    }

    return (
        <VStack gap="8" className={classNames(cls.tableWrapper, [className])}>
            <div className={classNames(cls.table)} ref={ref}>
                {!hideHeader && (
                    <div className={classNames(cls.rowHeader)}>
                        {columns?.map((el, index) => (
                            <div
                                key={index}
                                className={classNames(cls.cellHeader, {
                                    [cls.lastHeaderCell]: index + 1 === columns.length,
                                })}
                                style={{
                                    width: el.width || MIN_WIDTH,
                                }}
                            >
                                {el.renderHeader
                                    ? el.renderHeader(el.headerName)
                                    : el.headerName}
                            </div>
                        ))}
                    </div>
                )}
                {!!rows?.length && rows.map((row, rowIndex) => (
                    <div
                        key={row.id}
                        className={classNames(cls.row, {
                            [cls.rowLast]: rowIndex + 1 === rows.length,
                        })}
                        style={{
                            height: row.height || MIN_HEIGHT,
                        }}
                    >
                        {columns?.map((col, colIndex) => (
                            <div
                                key={colIndex}
                                className={classNames(cls.cell, {
                                    [cls.lastCell]: colIndex + 1 === columns.length,
                                })}
                                data-row={rowIndex}
                                data-col={colIndex}
                                style={{
                                    width: col.width || MIN_WIDTH,
                                    height: row.height || MIN_HEIGHT,
                                }}
                            >
                                {
                                    (activeCell?.col && +activeCell.col === colIndex)
                                    && (activeCell?.row && +activeCell.row === rowIndex)
                                    && !row[col.field]?.isImg
                                    && onChangeActiveCell
                                        ? (
                                            <input
                                                className={cls.inputCell}
                                                value={typeof row[col.field] === 'object' ? row[col.field]?.value : row[col.field]}
                                                onChange={(e) => onChangeActiveCell?.(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <div
                                                data-row={rowIndex}
                                                data-col={colIndex}
                                            >
                                                {
                                                    row[col.field]?.render
                                                        ? row[col.field].render(
                                                                col,
                                                                row,
                                                            )
                                                        : typeof row[col.field] === 'object'
                                                            ? row[col.field]?.value
                                                            : row[col.field]
                                                }
                                            </div>
                                        )
                                }
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {!rows?.length && (
                <HStack className={cls.empty} max justify="center">
                    {noData && (typeof noData === 'string' ? (<Typography.Text>{noData}</Typography.Text>) : (noData))}
                    {!noData && (
                        <Typography.Text>{t('Нет данных')}</Typography.Text>
                    )}
                </HStack>
            )}
        </VStack>
    );
};
