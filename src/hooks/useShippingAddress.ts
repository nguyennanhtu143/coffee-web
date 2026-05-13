import { useCallback, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { GHNDistrict, GHNProvince, GHNWard } from '../types';

export default function useShippingAddress() {
    const [provinces, setProvinces] = useState<GHNProvince[]>([]);
    const [districts, setDistricts] = useState<GHNDistrict[]>([]);
    const [wards, setWards] = useState<GHNWard[]>([]);
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
    const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);
    const [shippingFee, setShippingFee] = useState(0);
    const [loadingFee, setLoadingFee] = useState(false);

    const loadProvinces = useCallback(async () => {
        const data: any = await axiosClient.get('/shipping/provinces').catch(() => []);
        if (Array.isArray(data)) {
            data.sort((a: GHNProvince, b: GHNProvince) => a.ProvinceName.localeCompare(b.ProvinceName));
            setProvinces(data);
        }
    }, []);

    const onProvinceChange = useCallback(async (id: string) => {
        setDistricts([]);
        setWards([]);
        setSelectedDistrictId(null);
        setSelectedWardCode(null);
        setShippingFee(0);
        if (!id) return;
        const data: any = await axiosClient.get('/shipping/districts?provinceId=' + id).catch(() => []);
        if (Array.isArray(data)) {
            data.sort((a: GHNDistrict, b: GHNDistrict) => a.DistrictName.localeCompare(b.DistrictName));
            setDistricts(data);
        }
    }, []);

    const onDistrictChange = useCallback(async (id: string) => {
        setWards([]);
        setSelectedWardCode(null);
        setShippingFee(0);
        setSelectedDistrictId(id ? parseInt(id) : null);
        if (!id) return;
        const data: any = await axiosClient.get('/shipping/wards?districtId=' + id).catch(() => []);
        if (Array.isArray(data)) {
            data.sort((a: GHNWard, b: GHNWard) => a.WardName.localeCompare(b.WardName));
            setWards(data);
        }
    }, []);

    const onWardChange = useCallback(async (code: string) => {
        setSelectedWardCode(code || null);
        setShippingFee(0);
        if (!code || !selectedDistrictId) return;
        setLoadingFee(true);
        const result: any = await axiosClient.post('/shipping/calculate-fee?toDistrictId=' + selectedDistrictId + '&toWardCode=' + code).catch(() => null);
        if (result?.shippingFee !== undefined) setShippingFee(result.shippingFee);
        setLoadingFee(false);
    }, [selectedDistrictId]);

    const calculateFee = useCallback(async (districtId: number, wardCode: string) => {
        setSelectedDistrictId(districtId);
        setSelectedWardCode(wardCode);
        setShippingFee(0);
        setLoadingFee(true);
        const result: any = await axiosClient.post('/shipping/calculate-fee?toDistrictId=' + districtId + '&toWardCode=' + wardCode).catch(() => null);
        const fee = result?.shippingFee ?? 0;
        setShippingFee(fee);
        setLoadingFee(false);
        return fee;
    }, []);

    return { provinces, districts, wards, selectedDistrictId, selectedWardCode, shippingFee, loadingFee, loadProvinces, onProvinceChange, onDistrictChange, onWardChange, calculateFee };
}
