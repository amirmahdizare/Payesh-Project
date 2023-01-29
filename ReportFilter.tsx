import React, { useState } from 'react'

import { Box, Button, Grid, Typography } from '@mui/material'

import { Dayjs } from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AdapterJalali from '@date-io/date-fns-jalali';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

import { ChecklistType, LevelType, LocationType, ReportFilterType, SubgroupType } from 'types'
import { useGetData } from 'hooks';
import { getChecklist } from 'api/checklist';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { FormControlLoading, MultiSelect } from 'components/index';
import { getLocationsList } from 'api/location';
import { getSubgroupsList } from 'api/subgroup';
import { getLevelList } from 'api/level';
import { LocationCity, Search } from '@mui/icons-material';
import { SelectLocationsModal } from './components/SelectLocationsModal';
import { convertToPersianNumber } from 'utils';


export const ReportFilter = ({ handleSearch }: { handleSearch: Function }) => {

    const [locationModalVisibility, setLocationModalVisibility] = useState(false)

    const [filter, setFilter] = useState<ReportFilterType>({
        checklists: [],
        coordination_matching: 1,
        from_levels: [],
        to_levels: [],
        locations: [],
        reporters: [],
        sub_groups: [],
        start_date: new Date(),
        end_date: new Date(),
    })


    const [checkLists, errorOfChecklists, loadingOfChecklists] = useGetData(getChecklist, []) as [Array<ChecklistType>, object, boolean, Function]

    const [locations, errorOfLocations, loadingOfLocations] = useGetData(getLocationsList, []) as [Array<LocationType>, any, any, Function, Function]

    const [{ sub_groups = [] }, errorOfSubgroup, loadingOfSubgroup] = useGetData(getSubgroupsList, []) as [{ sub_groups: Array<SubgroupType> }, any, any, Function, Function]

    const [levels, errorOfLevels, loadingOfLevels] = useGetData(getLevelList, []) as [Array<LevelType>, any, any, Function, Function]

    const coordination_matching = [
        { id: 1, name: 'منطبق' },
        { id: 0, name: 'غیرمنطبق' },
    ]


    const handleChangeSingleValue = (item: keyof ReportFilterType, value: any) => {
        setFilter({ ...filter, [item]: value })
    }


    return (
        <Box p={2} my={1} border={'2px dashed #e2e2e2'} borderRadius={1}>

            <Grid spacing={2} container>
                <Grid item xs={12} md={6} lg={2}>
                    <Typography align='right' gutterBottom>تاریخ شروع</Typography>
                    <LocalizationProvider dateAdapter={AdapterJalali}>
                        <DatePicker
                            value={filter.start_date}
                            onChange={(newValue) => newValue ? handleChangeSingleValue('start_date', newValue) : null}
                            renderInput={(params) => <TextField fullWidth {...params} />}
                        />
                    </LocalizationProvider>

                </Grid>


                <Grid item xs={12} md={6} lg={2}>
                    <Typography align='right' gutterBottom>تاریخ پایان</Typography>

                    <LocalizationProvider dateAdapter={AdapterJalali} >
                        <DatePicker
                            value={filter.end_date}
                            onChange={(newValue) => newValue ? handleChangeSingleValue('end_date', newValue) : null}
                            renderInput={(params) => <TextField fullWidth {...params} value={(filter.end_date).toLocaleString('fa-ir')} />}
                        />
                    </LocalizationProvider>

                </Grid>


                <Grid item xs={12} md={6} lg={4}>
                    <Typography align='right' gutterBottom>مکان</Typography>
                    <Button startIcon={<LocationOnIcon sx={{ ml: 1 }} />} fullWidth variant='outlined' color='info' sx={{ height: '65%' }} onClick={() => setLocationModalVisibility(true)}>
                        <Typography fontSize={16}>انتخاب مکان</Typography>
                        {!!filter.locations.length && <Typography>&nbsp; ( {convertToPersianNumber(filter.locations.length)} مکان انتخاب شده است)</Typography>}
                    </Button>
                    <SelectLocationsModal
                        locations={filter.locations}
                        open={locationModalVisibility}
                        setLocations={(value: string[]) => handleChangeSingleValue('locations', value)}
                        setOpen={setLocationModalVisibility}
                    />

                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                    <Typography align='right' gutterBottom>زیرگروه</Typography>
                    {!loadingOfSubgroup ?
                        <MultiSelect
                            items={sub_groups}
                            handleChange={(value) => handleChangeSingleValue('sub_groups', value)}
                            persianItemName={'زیرگروه'}
                            value={filter.sub_groups}
                        />
                        : <FormControlLoading fullWidth />
                    }

                </Grid>



                <Grid item xs={12} md={6} lg={4}>
                    <Typography align='right' gutterBottom>از سطح</Typography>
                    {!loadingOfLevels ?
                        <MultiSelect
                            items={levels}
                            handleChange={(value) => handleChangeSingleValue('from_levels', value)}
                            persianItemName={'سطح'}
                            value={filter.from_levels}
                        />
                        : <FormControlLoading fullWidth />
                    }

                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                    <Typography align='right' gutterBottom>تا سطح</Typography>
                    {!loadingOfLevels ?
                        <MultiSelect
                            items={levels}
                            handleChange={(value) => handleChangeSingleValue('to_levels', value)}
                            persianItemName={'سطح'}
                            value={filter.to_levels}
                        />
                        : <FormControlLoading fullWidth />
                    }

                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                    <Typography align='right' gutterBottom>وضعیت انطباق</Typography>
                    <FormControl fullWidth>
                        <Select
                            value={filter.coordination_matching}
                            onChange={({ target: { value } }) => handleChangeSingleValue('coordination_matching', value)}
                        >
                            {coordination_matching.map(item => <MenuItem value={item.id}>{item.name}</MenuItem>)}

                        </Select>
                    </FormControl>


                </Grid>

                <Grid item xs={12} md={6} lg={62}>
                    <Typography align='right' gutterBottom>چک لیست</Typography>
                    {!loadingOfChecklists
                        ? <MultiSelect
                            items={checkLists}
                            handleChange={(value) => handleChangeSingleValue('checklists', value)}
                            persianItemName={'چک لیست'}
                            value={filter.checklists}
                        />
                        : <FormControlLoading fullWidth />
                    }

                </Grid>
                <Grid item xs={12} md={6} lg={10} justifyContent='flex-end' sx={{ float: 'right' }}>

                </Grid>

                <Grid item xs={12} md={6} lg={2} justifyContent='flex-end' sx={{ float: 'right' }}>
                    <Button variant='contained' color='primary' fullWidth startIcon={<Search sx={{ ml: 1 }} />} onClick={() => handleSearch(filter)}>
                        <Typography fontSize={{ xs: 14, lg: 16 }}>جستجو</Typography>
                    </Button>
                </Grid>


            </Grid>
        </Box>
    )
}
