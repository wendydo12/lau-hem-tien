/* assets/manifest.js — map key engine → file sprite. Nguồn sự thật duy nhất, UI chỉ đọc file này. */
export const SPRITES = {
  /* chủ quán + khách thường (64x64) */
  owner: 'nhan-vat/vn_00.png',
  /* khách Việt — OBJECT theo đúng SỐ FILE vn_XX (không phải mảng!) để WHO_SPR map chuẩn:
   * vn_00 chủ quán · vn_01 ông già báo · vn_02 nữ sinh · vn_03 anh VP · vn_04 bà cụ · vn_05 bé trai · vn_06 chị váy hồng · vn_07 shipper */
  vn: {
    0: 'nhan-vat/vn_00.png', 1: 'nhan-vat/vn_01.png', 2: 'nhan-vat/vn_02.png', 3: 'nhan-vat/vn_03.png',
    4: 'nhan-vat/vn_04.png', 5: 'nhan-vat/vn_05.png', 6: 'nhan-vat/vn_06.png', 7: 'nhan-vat/vn_07.png'
  },
  /* khách tu tiên (64x64 — đồng bộ scale) */
  xian: Array.from({length:16}, (_,i) => 'nhan-vat/xian_' + String(i).padStart(2,'0') + '.png'),
  /* 9 nồi lẩu (25/09: + canh chua cá pot_08, lẩu mắm pot_09) */
  pot: {
    ca_chua: 'mon-an/pot_00.png', nam: 'mon-an/pot_01.png', suon: 'mon-an/pot_02.png',
    thai: 'mon-an/pot_03.png', suki: 'mon-an/pot_04.png', dong_trung: 'mon-an/pot_05.png',
    tu_xuyen: 'mon-an/pot_06.png', hai_san: 'mon-an/pot_07.png',
    canh_chua: 'mon-an/pot_08.png', mam: 'mon-an/pot_09.png',
    bo: 'mon-an/pot_10.png', de: 'mon-an/pot_11.png', rieu: 'mon-an/pot_12.png'
  },
  /* topping + nước chấm + bí mật */
  item: {
    t_bo: 'mon-an/topping_00.png', t_tom: 'mon-an/topping_01.png', t_kim_cham: 'mon-an/topping_02.png',
    d_sa_te: 'mon-an/topping_03.png', t_bo_vien: 'mon-an/topping_04.png',
    t_muc: 'mon-an/topping3_00.png', t_ngheu: 'mon-an/topping3_01.png', t_ca_vien: 'mon-an/topping3_02.png',
    t_dau_hu_ky: 'mon-an/topping3_03.png', t_rau_muong: 'mon-an/topping3_04.png', t_mi_goi: 'mon-an/topping3_05.png',
    t_trung: 'mon-an/topping3_07.png',
    d_muoi_ot: 'mon-an/topping2_00.png', d_chao: 'mon-an/topping2_01.png', d_sa_te2: 'mon-an/topping2_02.png',
    d_sot_me: 'mon-an/topping2_03.png', t_udong: 'mon-an/topping2_04.png', t_cai_cuc: 'mon-an/topping2_05.png',
    t_cuu: 'mon-an/new1_00.png', t_de: 'mon-an/de_tuoi.png', t_ba_chi: 'mon-an/new1_02.png',
    /* 07/10: nhóm thịt bò · thịt dê mới vẽ */
    t_bo_tai: 'mon-an/bo_tai.png', t_bo_cuon: 'mon-an/bo_cuon.png',
    t_de_luoc: 'mon-an/de_luoc.png', t_dui_de: 'mon-an/dui_de.png', d_chao_vang: 'mon-an/chao_vang.png',
    /* 07/10 đợt 2: hải sản + chả/viên + rau củ */
    t_bach_tuoc: 'mon-an/bach_tuoc.png', t_ca_hoi: 'mon-an/ca_hoi.png', t_tom_vien: 'mon-an/tom_vien.png',
    t_thanh_cua: 'mon-an/thanh_cua.png', t_xuc_xich: 'mon-an/xuc_xich.png',
    t_khoai_mon: 'mon-an/khoai_mon.png', t_bap_ngot: 'mon-an/bap_ngot.png',
    t_cai_ngot: 'mon-an/cai_ngot.png',   /* 08/10: thêm cho đủ bộ rau */
    t_ca_dieu: 'mon-an/ca_dieu_lat.png', t_ca_vien_chien: 'mon-an/new1_04.png', t_dau_hu_non: 'mon-an/new1_05.png',
    t_chan_vit: 'mon-an/new1_06.png', t_cai_thia: 'mon-an/new1_07.png',
    d_mix: 'mon-an/new2_00.png', t_cu_sen: 'mon-an/new2_01.png', du_nam_bung_de: 'mon-an/new2_04.png',
    t_dong_co: 'mon-an/new2_05.png', t_dui_ga: 'mon-an/new2_06.png',
    t_gau: 'mon-an/new3_00.png', t_sun: 'mon-an/new3_01.png', t_bun: 'mon-an/new3_02.png', t_mien: 'mon-an/new3_03.png',
    d_hao_du: 'mon-an/dip_01.png', d_bo_dau: 'mon-an/dip_02.png', d_ot_toi: 'mon-an/dip_03.png',
    d_muoi_wasabi: 'mon-an/dip_04.png', d_mayo: 'mon-an/dip_05.png', d_dau_me: 'mon-an/dip_06.png',
    /* thực đơn bí mật */
    x_linh_chi: 'mon-an/topping_05.png', x_huyet_sen: 'mon-an/new2_07.png', x_linh_thu: 'mon-an/topping_06.png',
    x_bang_tam: 'mon-an/topping_07.png', x_nhan_sam: 'mon-an/new2_02.png', x_dong_trung: 'mon-an/new2_03.png',
    x_tuong_tien: 'mon-an/dip_00.png', x_mat_tuong: 'mon-an/dip_07.png'
  },
  /* props */
  prop: {
    neon: 'do-vat/prop_07.png', stool_red: 'do-vat/prop2_00.png', stool_blue: 'do-vat/prop2_01.png',
    pot_copper: 'do-vat/prop2_02.png', crane: 'do-vat/prop2_03.png', cauldron: 'do-vat/prop2_04.png',
    cashbox: 'do-vat/prop2_05.png', coin_old: 'do-vat/prop2_06.png', talisman: 'do-vat/prop2_07.png',
    lantern: 'do-vat/prop_01.png', steamer: 'do-vat/prop_02.png'
  },
  /* NỘI THẤT PHÒNG Ở (07/10): 2 bộ style, mỗi bộ 16 món — dùng cho màn "Phòng ở".
   * Bộ A Hẻm Việt = đồ phòng trọ Việt Nam thập niên 80–2000 (hv_*).
   * Bộ B Động Tiên = thư phòng – thiền thất tu tiên (tt_*). */
  room: {
    hemViet: {
      rem_hoa: 'do-vat/hv_rem_hoa.png', tv_crt: 'do-vat/hv_tv_crt.png', dai_cassette: 'do-vat/hv_dai_cassette.png',
      may_khau: 'do-vat/hv_may_khau.png', tu_nhieu_o: 'do-vat/hv_tu_nhieu_o.png', ban_tho: 'do-vat/hv_ban_tho.png',
      loc_lich: 'do-vat/hv_loc_lich.png', bang_khen: 'do-vat/hv_bang_khen.png', tranh_son_mai: 'do-vat/hv_tranh_son_mai.png',
      phich_nuoc: 'do-vat/hv_phich_nuoc.png', am_tich: 'do-vat/hv_am_tich.png', quat_cay: 'do-vat/hv_quat_cay.png',
      chieu_coi: 'do-vat/hv_chieu_coi.png', dep_nhua: 'do-vat/hv_dep_nhua.png', o_cam: 'do-vat/hv_o_cam.png',
      chau_kien: 'do-vat/hv_chau_kien.png'
    },
    dongTien: {
      binh_phong: 'do-vat/tt_binh_phong.png', an_thu: 'do-vat/tt_an_thu.png', ke_go: 'do-vat/tt_ke_go.png',
      ghe_go: 'do-vat/tt_ghe_go.png', ban_tra: 'do-vat/tt_ban_tra.png', binh_lam: 'do-vat/tt_binh_lam.png',
      den_long: 'do-vat/tt_den_long.png', ruong_go: 'do-vat/tt_ruong_go.png', bo_doan: 'do-vat/tt_bo_doan.png',
      lu_huong: 'do-vat/tt_lu_huong.png', gia_kiem: 'do-vat/tt_gia_kiem.png', guong_dong: 'do-vat/tt_guong_dong.png',
      den_luu_ly: 'do-vat/tt_den_luu_ly.png', tranh_truc: 'do-vat/tt_tranh_truc.png', tham: 'do-vat/tt_tham.png',
      de_go: 'do-vat/tt_de_go.png'
    },
    nen: 'canh-nen/phong-tro-tu-tien.png',
    /* 07/10: mỗi bộ style có nền riêng — sàn + màu tường */
    nenTuTien: 'canh-nen/phong-tu-tien.png',   /* sàn gỗ + tường be vân gỗ */
    nenHemViet: 'canh-nen/phong-hem-viet.png'   /* sàn gạch bông + tường vàng/xanh ngọc */
  },
  /* TRANG BỊ NÂNG CẤP (08/10): mỗi món một hình riêng — trước đây kho ảnh dùng lại 1 hình chung.
   * 8 món hẻm + 5 pháp bảo tiên gia. */
  upg: {
    sealer: 'do-vat/upg_sealer.png', sign: 'do-vat/upg_sign.png', seats: 'do-vat/upg_seats.png',
    ads: 'do-vat/upg_ads.png', slot4: 'do-vat/upg_slot4.png', ac: 'do-vat/upg_ac.png',
    premium: 'do-vat/upg_premium.png', branch: 'do-vat/upg_branch.png',
    tulin: 'do-vat/upg_tulin.png', anthan: 'do-vat/upg_anthan.png', phap_khi: 'do-vat/upg_phap_khi.png',
    ho_phap: 'do-vat/upg_ho_phap.png', cam_do: 'do-vat/upg_cam_do.png'
  },
  scene: 'canh-nen/scene_alley_night.png'
};
