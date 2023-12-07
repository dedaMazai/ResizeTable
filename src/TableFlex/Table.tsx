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

const caretOffset = 7;
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
    const mousePosition = useRef(0);
    const movingEl = useRef<HTMLDivElement | null>();
    const ref = useRef<HTMLDivElement | null>(null);
    const { t } = useTranslation();

    const changeActiveCell = useCallback(
        (e: MouseEvent) => {
            const htmlTarget = e.target as HTMLDivElement;
            const data = (htmlTarget.closest('#tableCell') as HTMLDivElement)?.dataset;

            if (data.col && data.row) {
                onSelectCell?.(data.col, data.row);
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


    function onMoveTableCell(e: MouseEvent) {
        e.preventDefault();

    //     if (clientXref.current === 0) {
    //         clientXref.current = e.clientX;
    //         const cellStyle = window.getComputedStyle(movingEl.current);
    //         const pLeft = parseFloat(cellStyle.getPropertyValue('padding-left')) || 0;
    //         const pRight = parseFloat(cellStyle.getPropertyValue('padding-right')) || 0;
    //         startElementWidth.current = movingEl.current.offsetWidth - pLeft - pRight;
    //         startElementWidth.current = startElementWidth.current >= 0
    //             ? startElementWidth.current
    //             : 0;
    //     }

    //     const curOffset = clientXref.current - e.clientX;
    //     const calcWidth = startElementWidth.current - curOffset;

    //     if (calcWidth >= minimumResizingWidth) {
    //     const { cellIndex } = movingEl.current;

    //     cellIndex >= 0 && [...(tableElement.tBodies[0]?.rows || [])].forEach((row) => {
    //         row.cells[cellIndex].style.width = `${calcWidth}px`;
    //     });

    //     movingEl.current.style.width = `${calcWidth}px`;
    // }
    }

    function onMovingStart(e: MouseEvent) {
        const { target } = e;
        const htmlTarget = target as HTMLDivElement;
        let tableCell = htmlTarget.closest('#tableCell') as HTMLDivElement;

        const elementRect = tableCell?.getBoundingClientRect();

        const leftSpaceToBorder = mousePosition.current - (elementRect?.left || 0);
        const rightSpaceToBorder = (elementRect?.right || 0) - mousePosition.current;

        const isNearLeftBorder = leftSpaceToBorder < caretOffset;
        const isNearRightBorder = rightSpaceToBorder < caretOffset;

        if (isNearLeftBorder) {
            const previousSibling = tableCell.previousElementSibling as HTMLDivElement;

            if (previousSibling) {
                movingEl.current = previousSibling;
            }
        }

        if (isNearRightBorder) {
            movingEl.current = tableCell;
        }
    }
    // function resetElements() {
    //     if (!movingElParent.current) {
    //       return;
    //     }

    //     [...(movingElParent.current?.cells || [])].forEach((cell) => {
    //       cell.style.cursor = '';
    //     });
    // }

    function onCursorWatch(e: MouseEvent) {
        const {
            target,
            clientX,
        } = e;
        const htmlTarget = target as HTMLElement;

        mousePosition.current = clientX;
        const tableCell: HTMLElement | null = htmlTarget.closest('#tableCell');

        if (!tableCell) {
            return;
        }

        const {
            left,
            right,
        } = tableCell.getBoundingClientRect();

        const leftSpaceToBorder = clientX - left;
        const rightSpaceToBorder = right - clientX;

        const isNearLeftBorder = leftSpaceToBorder < caretOffset;
        const isNearRightBorder = rightSpaceToBorder < caretOffset;

        const isNearVerticalBorder = isNearLeftBorder || isNearRightBorder;

        if (isNearRightBorder && tableCell.parentElement?.lastElementChild === tableCell) {
            return;
        } else if (isNearLeftBorder && tableCell.parentElement?.querySelector('#tableCell') === tableCell) {
            return;
        } else if (isNearVerticalBorder) {
            tableCell.style.cursor = 'col-resize';
        } else {
            tableCell.style.cursor = '';
        }

        if (movingEl.current) {
            onMoveTableCell(e);
        }
    }

    useEffect(() => {
        document.addEventListener('mousemove', onCursorWatch, true);
        document.addEventListener('mousedown', onMovingStart, true);
        // document.addEventListener('mouseup', onStopMoving);

        return () => {
            document.removeEventListener('mousemove', onCursorWatch, true);
            document.removeEventListener('mousedown', onMovingStart, true);
            // document.removeEventListener('mouseup', onStopMoving);
        };
    }, []);

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
                                id="tableCell"
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
                                id="tableCell"
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
                                            row[col.field]?.render
                                                ? row[col.field].render(
                                                        col,
                                                        row,
                                                    )
                                                : typeof row[col.field] === 'object'
                                                    ? row[col.field]?.value
                                                    : row[col.field]
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
