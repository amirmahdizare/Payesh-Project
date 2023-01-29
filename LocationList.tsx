import React, { useEffect, useState } from 'react'

import { Alert, Box, Button, IconButton, LinearProgress, Link, Typography } from '@mui/material'
import { useGetData } from 'hooks'
import { LevelType, LocationType, UserType } from 'types';

import { getLocationChildrens, getLocationsList } from 'api/location';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Delete, Info } from '@mui/icons-material';


import { DeleteModal } from './components/DeleteModal';
import { DetailModal } from './components/DetailModal';
import { getLevelList } from 'api/level';
import { getUsers } from 'api/user';
import { FilterAccordion } from 'components/index';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LocationBreadcrumbs } from './components/LocationBreadcrumbs';


const LocationList = () => {

    const [filter, setFilter] = useState({})

    const [api, setApi] = useState<{
        endpoint: (parmas?: any) => Promise<any>,
        params: { location_id?: string, [key: string]: any, filter?: Object }
    }>
        ({
            endpoint: getLocationsList,
            params: {}
        })

    const [locations, error, loading, refreshData, clearError] = useGetData(api.endpoint, [], { ...api.params, filter }) as [Array<LocationType>, any, any, Function, Function]

    const [levels] = useGetData(getLevelList, []) as [LevelType[]]

    const [users] = useGetData(getUsers, []) as [UserType[]]

    const [finalData, setFinalData] = useState<{ arr: any[] }>({ arr: [] })

    const [selectedLocations, setSelectedLocations] = useState<Array<LocationType>>([])

    const navigate = useNavigate()

    const [deleteModalVisibility, setDeleteModalVisibility] = useState<boolean>(false)
    const [targetRecord, setTargetRecord] = useState<LocationType>()
    const [detailModal, setDetailModal] = useState<boolean>(false)



    const handleDeleteRecord = (record: any, refresh: boolean) => {
        if (refresh)
            refreshData()
        setTargetRecord(record)
        setDeleteModalVisibility(true)
    }

    const backToDefaults = () => {
        setApi({
            endpoint: getLocationsList,
            params: {}
        })
    }

    useEffect(() => {
        if (users && levels) {
            var finalData = locations.map(item => {
                const manager_name = users.filter(user => user.id == item.manager)[0]?.full_name || '-'

                const level_name = levels.filter(level => level.id == item.level_id)[0]?.name || 'سطح وجود ندارد'

                return ({ manager_name, level_name, ...item })
            })

            setFinalData({ arr: finalData })
        }


        return () => {
            if (clearError)
                clearError()
        }
    }, [locations])

    const handleChangeApi = (id: string, location: LocationType) => {
        setSelectedLocations([...selectedLocations, location])
        setApi({
            endpoint: getLocationChildrens,
            params: { location_id: id }

        })

    }
    useEffect(() => {
        refreshData()
        return () => {
        }
    }, [api])

    useEffect(() => refreshData(), [filter])


    const handleComeBack = () => {
        selectedLocations.pop()
        if (selectedLocations.length == 0)
            backToDefaults()
        else {
            const lastLocation = selectedLocations.pop()
            if (lastLocation)
                handleChangeApi(lastLocation.id, lastLocation)
        }
    }

    return (
        <Box sx={{ p: { lg: 1 }, mt: { lg: 1, xs: 3 }, maxWidth: '100vw', boxSizing: 'border-box' }}>
            <Box sx={{ flexDirection: { xs: 'column', lg: 'row' }, display: { lg: 'flex' }, justifyContent: 'space-between' }}>
                <Typography component={'p'}>
                    <Typography align='right' gutterBottom variant='h6'>لیست مکان ها</Typography>
                    <LocationBreadcrumbs locations={selectedLocations} />
                </Typography>
                <Box>

                    {!!api.params?.location_id && <Button color='warning' sx={{ mt: { xs: 2, lg: 0 }, height: 'fit-content', ml: 2 }} onClick={() => handleComeBack()} variant='contained'>

                        <ArrowBackIcon sx={{ ml: 1, fontSize: { lg: '2rem' } }} />
                        بازگشت به مکان های قبلی
                    </Button>}

                    <Button sx={{ mt: { xs: 2, lg: 0 }, height: 'fit-content' }} onClick={() => navigate(`/location/add/${selectedLocations[selectedLocations.length - 1]?.id || null}`)} variant='contained'>

                        <AddCircleOutlineIcon sx={{ ml: 1, fontSize: { lg: '2rem' } }} />
                        اضافه کردن مکان
                    </Button>
                </Box>

            </Box>

            {loading && <LinearProgress sx={{ my: 2 }} />}

            {!!error && <Alert variant='filled' sx={{ mt: 2 }} severity='error'>

                &nbsp;&nbsp;&nbsp; <span>{'مکانی یافت نشد'}</span>
            </Alert>}

            {api.endpoint == getLocationsList && <FilterAccordion
                items={[
                    {
                        key: 'name',
                        label: 'نام',
                        placeholder: 'نام را وارد کنید'
                    },
                    {
                        key: 'CIAM',
                        label: 'CIAM',
                        placeholder: ' ciam را وارد کنید'
                    },
                    {
                        key: 'parent_location',
                        label: 'مکان والد',
                        placeholder: 'مکان والد را وارد کنید'
                    },
                ]}
                submitFilter={setFilter}
                title={'مکان ها'}
                sx={{ my: 2 }}
                bodySx={{ pt: 2 }}
                headerSx={{ backgroundColor: 'primary.main', color: '#fff', '& .MuiSvgIcon-root ': { color: '#fff' } }}
            />}

            {typeof finalData.arr != 'undefined' && <TableContainer sx={{ my: 1 }} component={Paper}>
                <Table sx={{ minWidth: { lg: 650 } }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'GrayText' }} align="right">نام</TableCell>
                            <TableCell sx={{ color: 'GrayText' }} align="right">مدیر</TableCell>
                            <TableCell sx={{ color: 'GrayText' }} align="right">والد</TableCell>
                            <TableCell sx={{ color: 'GrayText' }} align="right">سطح</TableCell>
                            <TableCell sx={{ color: 'GrayText' }} align="right">طول جغرافیایی</TableCell>
                            <TableCell sx={{ color: 'GrayText' }} align="right">عرض جغرافیایی</TableCell>
                            <TableCell sx={{ color: 'GrayText' }} align="center">عملیات</TableCell>
                        </TableRow>
                    </TableHead>


                    <TableBody>
                        {finalData?.arr.map((row: LocationType) => (
                            <TableRow
                                key={row.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { background: '#e2e2e2' } }}

                            >

                                {/* <TableCell align="right">{row.id}</TableCell> */}
                                <TableCell align="right"><Link underline='hover' sx={{ cursor: 'pointer' }} onClick={() => handleChangeApi(row.id, row)} >{row.name}</Link></TableCell>
                                <TableCell align="right">{row.manager_name}</TableCell>
                                <TableCell align="right">{row.parent_location}</TableCell>
                                <TableCell align="right">{row.level_name}</TableCell>
                                <TableCell align="right">{row.location_x}</TableCell>
                                <TableCell align="right">{row.location_y}</TableCell>
                                <TableCell align="center">
                                    {/* <IconButton color='primary' onClick={() => navigate('/location/edit/' + row.id)} >  <Edit /></IconButton> */}
                                    <IconButton color='info' onClick={() => { setDetailModal(true); setTargetRecord(row) }}> <Info /></IconButton>
                                    <IconButton onClick={() => { handleDeleteRecord(row, false) }} color='error'>  <Delete /></IconButton>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {finalData?.arr?.length == 0 && !loading &&
                    <Box sx={{ width: '100%', my: 2, textAlign: 'center' }}>
                        <Typography align='center'>مکانی با این مشخصات وجود ندارد!</Typography>
                    </Box>}

            </TableContainer>}

            <DeleteModal
                record={targetRecord}
                openHandler={setDeleteModalVisibility}
                onModalClose={handleDeleteRecord}
                open={deleteModalVisibility}
            />

            <DetailModal
                record={targetRecord}
                openHandler={setDetailModal}
                // onModalClose={handleDeleteRecord}
                open={detailModal}
            />
        </Box>
    )
}

export { LocationList }
