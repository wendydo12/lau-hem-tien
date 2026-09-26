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
  /* 8 nồi lẩu */
  pot: {
    ca_chua: 'mon-an/pot_00.png', nam: 'mon-an/pot_01.png', suon: 'mon-an/pot_02.png',
    thai: 'mon-an/pot_03.png', suki: 'mon-an/pot_04.png', dong_trung: 'mon-an/pot_05.png',
    tu_xuyen: 'mon-an/pot_06.png', hai_san: 'mon-an/pot_07.png'
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
    t_cuu: 'mon-an/new1_00.png', t_de: 'mon-an/new1_01.png', t_ba_chi: 'mon-an/new1_02.png',
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
  scene: 'canh-nen/scene_alley_night.png'
};
