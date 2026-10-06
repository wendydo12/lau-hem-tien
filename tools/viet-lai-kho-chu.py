#!/usr/bin/env python3
"""Viết lại kho chữ của Lẩu Hẻm Tiên — thay toàn bộ câu chữ vay từ game tham khảo.

Chạy: python3 tools/viet-lai-kho-chu.py  (ghi trực tiếp vào game/js/engine/data.js)
Sau khi chạy: đồng bộ sang webapp/js, chạy test, rồi chạy lại bộ so khớp.
"""
import os
import re
import sys

BASE = os.path.expanduser("~/projects/laudem-tien")
DATA = os.path.join(BASE, "game/js/engine/data.js")

# ============================================================ TÊN KHÁCH
NM_NU = ["Ái Linh", "Anh Thư", "Bảo Ngọc", "Bích Hà", "Cẩm Ly", "Chiêu Dương", "Diệu Hương",
         "Đông Nhi", "Gia Mẫn", "Hà Tiên", "Hải Yến", "Hiểu Vy", "Hoa Sim", "Hoàng Yến",
         "Hồng Nhung", "Hương Giang", "Khả Ái", "Kiều Oanh", "Kim Oanh", "Lan Anh", "Lệ Quyên",
         "Linh Đan", "Mai Chi", "Minh Thư", "Mộng Cầm", "Mỹ Duyên", "Ngân Hà", "Nguyệt Ánh",
         "Nhã Ca", "Như Ý", "Phương Linh", "Quỳnh Chi", "Sao Khuê", "Tâm Đan", "Thanh Hà",
         "Thiên Kim", "Thùy Lâm", "Thương Thương", "Tiểu Mi", "Trang Đài", "Tú Quyên",
         "Tường Vy", "Uyển Đình", "Vân Du", "Vy Oanh", "Xuân Nghi", "Yến Nhi", "Ý Lan",
         "Diệp Anh", "Hạ Mi", "Mộc Trà", "Ngọc Hân", "Phượng Các", "Song Nhi", "Thục Quyên",
         "Tiên Sa", "Trúc Quỳnh", "Tuyết Nhung", "Vệ Lam", "Xuân Tình"]
NM_NAM = ["Anh Tuấn", "Bảo Khang", "Chí Cường", "Công Thành", "Đắc Huy", "Đông Kiên", "Duy Kiệt",
          "Gia Bảo", "Hải Đăng", "Hiếu Nghĩa", "Hoàng Nam", "Huy Hoàng", "Khang Dụ",
          "Khôi Nguyên", "Long Vũ", "Minh Quân", "Nam Khánh", "Ngọc Sơn", "Nhật Long",
          "Phong Vũ", "Phúc Lâm", "Quang Vinh", "Quốc Khánh", "Sơn Hải", "Tấn Phát",
          "Thái Dương", "Thanh Liêm", "Thiện Khiêm", "Trí Dũng", "Trung Hiếu", "Tuấn Kiệt",
          "Vĩnh Phúc", "Việt Hoàng", "Xuân Bách", "Đình Trung", "Mạnh Cường", "Bá Kiến",
          "Cao Sơn", "Danh Thắng", "Hữu Phước"]
NM_BE = ["Bé Mít", "Bé Ổi", "Bé Me", "Bé Bầu", "Bé Khoai", "Bé Cún", "Bé Miu", "Bé Nấm",
         "Bé Bí", "Bé Chanh", "Bé Dừa", "Bé Xoài", "Bé Mận", "Bé Đào", "Bé Táo", "Bé Vải",
         "Bé Sim", "Bé Sen"]
NM_TIEN = ["Hàn", "Tần", "Liễu", "Cố", "Tạ", "Úc", "Ân", "Doãn", "Khương", "Nhiếp",
           "Vệ", "Trang", "Chung", "Bành", "Đoàn", "Hứa"]
NM_TIEN_DANH = ["Vô Ưu", "Thanh Vũ", "Ngạo Sương", "Hàn Nguyệt", "Tử Cầm", "Bạch Lộ",
                "Minh Không", "Tuyết Y", "Kiếm Vân", "Đan Phong", "Ngọc Kỳ", "Phiêu Bồng",
                "Tịch Dương", "Yên Vũ", "Vấn Nguyệt", "Nhược Lan"]
NM_HO = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng",
         "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Trương", "Đinh", "Lâm", "Mai"]

# ============================================================ GIỌNG GỌI MÓN
PERSONA = [
    {"o": ["Chị lấy", "Bà chủ ơi cho chị", "Chị đặt"], "e": [" nha cưng!", " giùm chị!", " nhé em!"]},
    {"o": ["Em lấy", "Cho em một", "Chị ơi em gọi"], "e": [" ạ!", " nha chị!", " với ạ!"]},
    {"o": ["Anh gọi", "Cho anh", "Cô chủ cho anh"], "e": [" nhé!", " nha em!", " giùm cái!"]},
    {"o": ["Bà kêu", "Cháu cho bà", "Bà muốn"], "e": [" nghen con!", " nhé cháu!", " nha con!"]},
    {"o": ["Con gọi", "Cho con", "Cô ơi con lấy"], "e": [" ạ!", " nha cô!", " với ạ!"]},
    {"o": ["Chú gọi", "Cho chú", "Cháu cho chú"], "e": [" nhé con!", " nghen cháu!", " nha!"]},
    {"o": ["Shipper lấy đơn", "Cho anh đơn", "Anh lấy gấp"], "e": [" nha em, gấp!", " liền giùm!", " nhé!"]},
]
XPERSONA = [
    {"o": ["Chưởng quầy, bản tọa muốn", "Đạo hữu, mang cho ta", "Bổn tọa gọi"], "e": [".", " ngay.", " nhé."]},
    {"o": ["Tại hạ xin", "Phiền đạo hữu bưng", "Cho tại hạ"], "e": [".", " một phần.", " nhé."]},
    {"o": ["Ngửi mùi mà tới, bổn tiên muốn", "Cho ta nồi", "Nghe đồn ngon, cho ta"], "e": [".", " nào.", " đi."]},
]

# ============================================================ BỂ REVIEW NGẮN
TXT = {
    "great": [
        "Nước {mon} đậm tới giọt cuối, húp xong là thấy ấm cả người",
        "Nồi {mon} bưng ra còn sôi lăn tăn, thơm tới mức đứa bàn bên phải hỏi tên món",
        "{top} nhúng ba giây vớt lên còn giòn ngọt, đúng chuẩn dân ăn lẩu",
        "Chủ quán nhìn mặt là nhớ đơn, tới lần hai khỏi cần gọi lại",
        "Nêm nếm vừa tay ghê, cạn nồi mà không thấy khát nước",
        "Bàn vỉa hè mà nồi lẩu nghiêm túc hơn mấy chỗ máy lạnh",
        "Đồ nhúng tươi roi rói, bò xắt dày, gắp lên thấy đã con mắt",
        "Chén nước chấm pha khéo, chấm gì cũng hợp",
        "Ngồi hẻm gió thổi mà lẩu nóng hổi, đã gì đâu",
        "Nồi to đùng, hai người ăn muốn xỉu vẫn còn dư",
        "Đi làm về mệt, ghé đây làm nồi là tỉnh liền",
        "Nước lẩu trong veo mà ngọt hậu, không kiểu ngọt đường",
        "Khói lẩu quyện mùi sả, đứng đầu hẻm đã nghe",
        "Tươi tới mức nhìn đĩa rau là biết mới đi chợ sáng nay",
        "Gọi nồi {mon} kèm {top}, ăn xong chốt luôn quán ruột",
        "Rau để ráo nước, nhìn khâu sơ chế là thấy kỹ",
        "Lửa canh đều, ăn tới cuối nồi vẫn không khét đáy",
        "Bưng nồi ra nhanh hơn mình nghĩ, còn kịp chụp tấm hình",
        "Khách chờ được bưng thêm dĩa rau, chủ quán có tâm",
        "Vị cay nồi {mon} đã ghê, mà còn thơm nữa",
        "Ngồi tới khuya vẫn được tiếp, không bị nhắc giờ",
        "Múc chén nước đầu là biết nồi này nấu thật lòng",
        "Quán nhỏ chật mà xoay ca khéo, chờ xíu là có",
        "Từ chỗ ghét ăn lẩu mà nếm xong tự đổi ý",
        "Đêm mưa ghé làm nồi, nghe mưa rơi mà bụng ấm",
        "Bò cuộn sụn, {top} đủ vị, đúng bài",
        "Giá này mà chất lượng này thì đi hoài cũng được",
        "Cả xóm rủ nhau đi, ngồi chật mà vui",
        "Nước lẩu để lửa riu riu cả buổi vẫn đậm",
        "Có món {mon} này thôi là đủ giữ khách ở lại",
    ],
    "xgreat": [
        "Linh khí trong nồi {mon} ngưng mà không tán, bổn tọa phải hỏi thăm bí quyết",
        "Tu luyện ngàn năm chưa từng nếm thứ này ở phàm gian",
        "Một ngụm vào, chân khí chạy khoan khoái khắp kinh mạch",
        "Hỏa hậu trong nồi có đạo vận, kẻ phàm nhân này không tầm thường",
        "Linh tài tươi, không giống hàng tồn đã lâu trong túi trữ vật",
        "Sư muội bổn tọa vốn kén ăn, vậy mà gật đầu hai lượt",
        "Nấu bằng tâm, ta ghi tên quán vào ngọc giản riêng",
        "Mùi hương này lọt cả kết giới, bổn tọa phải tới xem cho rõ",
        "Đáng. Chỉ một nồi mà linh đài sáng ra vài phần",
    ],
    "xbad": [
        "Bổn tọa chờ tới mức chân hỏa trong người muốn trào ra ngoài",
        "Phàm nhân nấu chậm còn thông cảm được, nấu sai thì quá đáng",
        "Linh khí tán hết, còn lại nước lã",
        "Hừ. Cảnh giới ta không hạ thấp vì một nồi lẩu, nhưng ta nhớ mặt quán này",
        "Tu luyện ba trăm năm, suýt đạo tâm bất ổn vì một nồi quá mặn",
        "Đợi tới khi linh thạch trong túi nguội ngắt",
    ],
}

PARTS = {
    "great": [["{mon} đậm nước", "Nồi sôi sùng sục", "{top} tươi thật", "Đồ nhúng đầy đặn", "Nêm vừa tay", "Chấm pha khéo", "Thơm nhức mũi", "Nồi nóng hổi", "{mon} đúng điệu", "Rau tươi rói"],
              ["chủ quán có tâm", "ăn là nghiền", "mai rủ bạn tới", "đáng từng đồng", "hẻm nhỏ mà xịn", "không chê được câu nào", "tuần sau ghé nữa", "mười điểm không hơn", "hết sạch nước chấm", "ấm bụng tới sáng"]],
    "ok": [["Được đấy", "Ăn ổn", "{mon} tạm ngon", "Vị tròn tròn", "{top} cũng ổn", "Đâu đó tám điểm"],
           ["nhưng nêm hơi mặn", "nhưng {top} hơi ít", "lần sau đổi nồi khác", "vẫn ghé lại nữa", "giá chấp nhận được", "chấm hơi cay", "đợi hơi lâu chút", "mong thêm món mới"]],
    "meh": [["Tàm tạm", "Cũng được", "{mon} nhạt nhạt", "Mặn hơn mình tưởng", "Không ấn tượng", "{top} dai dai"],
            ["chẳng có gì nhớ", "chắc thôi không ghé", "{top} ít thật", "mong quán chỉnh lại", "ăn một lần cho biết", "giá này hơi phí"]],
    "bad": [["Không hợp miệng", "{top} bở rệu", "{mon} khác xa quảng cáo", "Vị lạ hoắc", "Nước mặn chát"],
            ["ăn không trôi", "hơi hụt hẫng", "thôi không quay lại", "tiếc số tiền"]],
    "wait": [["Ngon nhưng đợi lâu", "Chờ mỏi chân", "Giờ đông nên chậm", "Đông nghẹt", "Chờ muốn bỏ"],
             ["bù lại {mon} ngon", "kỳ sau nhanh hơn nha", "chờ vậy mà đáng", "mong quán thêm tay", "lẩu vẫn ngon"]],
    "timeout": [["Ngồi chờ mãi không ai nấu", "Chờ mỏi cả cổ", "Đợi hoài không thấy nồi", "Không ai để ý tới bàn", "Xếp hàng muốn mọc rễ", "Gọi xong là im bặt", "Chờ gần chục phút", "Đông mà làm không kịp", "Nhìn quầy mà không ai nhắc đơn", "Chờ dài hơn cả nấu"],
                ["bỏ về luôn", "đi chỗ khác", "thôi khỏi ăn", "hết nhẫn nại", "kỳ sau không ghé", "buồn thật", "cụt hứng", "về tay không", "mất toi buổi tối", "hụt hẫng ghê"]],
    "wrong": [["Nấu sai món", "Gọi một kiểu bưng một nẻo", "Kêu {mon} mà ra nồi khác", "Nhầm đơn", "Bưng nhầm nồi", "Topping lộn tùng phèo"],
              ["phải đợi nấu lại", "kỳ sau dặn kỹ hơn", "hơi bực mình", "tốn thời gian", "không vui chút nào", "cần để ý hơn"]],
    "cheap": [["Rẻ mà ngon", "Giá sinh viên", "Rẻ hơn mình tưởng", "{mon} giá mềm", "Nồi to mà giá nhẹ", "Giá thương lượng được"],
              ["quá hời", "ủng hộ tới cùng", "chất lượng xứng giá", "mai kéo bạn tới", "đáng đồng tiền bát gạo", "ghé đều đều"]],
    "soldout": [["Quán hết % rồi", "Tới nơi thì hết %", "Hết % sớm vậy", "Thèm % mà không còn", "Đến trễ mất %"],
                ["tiếc thật", "chuẩn bị thêm nha", "kỳ sau tới sớm", "buồn xíu", "đành gọi nồi khác", "hụt hẫng"]],
    "soldoutPartial": [["Mấy nồi đầu ngon lành", "Ăn nửa chừng thì hết %", "Nhóm mình chỉ đủ % cho nửa bàn", "Nồi đầu ổn, lượt sau hết %", "Chạy được nửa buổi thì hết %"],
                       ["tiếc là chưa trọn vẹn", "cũng đỡ phần nào", "đành chia nhau", "thông cảm được", "mong trữ dư thêm"]],
    "soldoutOnl": [["Đặt hạc mà quán hết %", "Đơn tiên hạc bị hủy vì hết %", "Đặt xong mới hay hết %", "Nhận đơn rồi mới báo hết %"],
                   ["tiếc thật", "đành đặt chỗ khác", "mong quán cập nhật menu", "kỳ sau đặt sớm hơn", "chạnh lòng"]],
    "refused": [["Quán không bán cho mình", "Bị mời ra", "Tự dưng không bán", "Đứng chờ rồi bị từ chối"],
                ["chạnh lòng", "kỳ sau không ghé", "kỳ lạ thật", "không hiểu nổi", "mất công đi"]],
    "late": [["Hạc chờ lâu quá", "Giao trễ hẹn", "Đặt hạc mà chờ dài cổ", "Hạc đậu mỏi cánh", "Đơn làm chậm rì"],
             ["lẩu nguội mất ngon", "kỳ sau đặt chỗ khác", "nước chấm đổ hết", "cụt hứng", "thôi không đặt nữa"]],
    "pricey": [["Giá hơi chát", "{mon} ngon mà đắt", "Giá cao hơn mặt bằng hẻm", "Nồi nhỏ mà tiền to"],
               ["chắc thôi không ghé", "mong bớt chút giá", "ăn một lần thôi", "ví mỏng quá"]],
}

LONG = {
    "great": [["Lần đầu mò vào hẻm theo lời rủ của đứa bạn, không ngờ đáng công.",
               "Thấy bảng neon cuối hẻm nên tấp vào thử.",
               "Nghe khen nhiều quá, hôm nay mới sắp xếp đi được.",
               "Thành khách quen từ dạo trước, giờ tuần nào cũng ghé.",
               "Trời trở lạnh, thèm gì đó nóng nên gọi nồi {mon}.",
               "Đặt nồi {mon} cỡ lớn mang về cho cả nhà.",
               "Tan ca đói bụng, chạy thẳng ra quán.",
               "Mình vốn khó tính chuyện nước lẩu mà quán này qua được cửa ải."],
              ["Nước {mon} ngọt hậu, mặn ngọt rõ ràng, {top} nhúng vừa tới vẫn giòn.",
               "Nước lẩu thơm, béo mà không ngấy, húp tới muỗng cuối.",
               "{top} tươi, nhìn sắc là biết hàng nhập trong ngày.",
               "Chủ quán hỏi từng bàn ăn cay được tới đâu, chu đáo.",
               "Khách đông mà nồi bưng ra chưa tới năm phút.",
               "Nồi đầy đặn, topping không hề bị bớt xén.",
               "Bàn vỉa hè lau sạch, ngồi gió thổi mát rượi.",
               "Nồi lớn ăn no căng bụng, giá lại nhẹ nhàng."],
              ["Chắc chắn ghé lại.", "Rủ hội bạn tới cho biết.", "Mười điểm, khỏi bàn.", "Ai chưa thử thì nên thử.", "Mong quán giữ phong độ.", "Cuối tuần ghé nếm nồi khác."]],
    "ok": [["Ghé buổi chiều nên quán vắng, ngồi thoải mái.", "Thấy bảng đề cử {mon} nên gọi thử.", "Quán ngay gần nhà nên ghé cho tiện.", "Đặt mang về cho cả nhà ăn tối."],
           ["Lẩu ngon, chỉ hơi mặn với khẩu vị mình.", "{top} ổn nhưng hơi ít so với tiền.", "Nêm đều tay, không có gì để chê nhiều.", "Chủ quán vui vẻ mà hôm nay ra món hơi chậm.", "Nước để lâu cạn bớt nên càng về sau càng mặn."],
           ["Nhìn chung được, sẽ ghé lại.", "Bốn sao, kỳ sau thử nồi khác.", "Tàm tạm hài lòng.", "Chỉnh thêm chút là tròn năm sao."]],
    "meh": [["Lần đầu ghé cho biết.", "Nghe khen nhiều nên tò mò.", "Ghé mua mang về ăn thử."],
            ["{mon} nhạt, nước lẩu không rõ vị.", "{top} dai, không tươi như mình nghĩ.", "Mặn gắt hơn khẩu vị.", "Nồi hơi nhỏ so với giá.", "Chật chội, ngồi hơi nóng."],
            ["Chắc thôi không ghé nữa.", "Cũng thường, chẳng nhớ gì.", "Mong quán chỉnh lại.", "Ăn một lần cho biết."]],
    "bad": [["Thật lòng hơi hụt hẫng lần này.", "Mua về mà bỏ dở nửa nồi.", "Không còn được như lần trước."],
            ["{top} bở, nghi để qua ngày.", "{mon} vị lạ, khác hẳn mọi khi.", "Nước mặn chát, topping đếm trên đầu ngón tay.", "Bưng ra bị sóng sánh đổ cả ra bàn."],
            ["Thôi không quay lại.", "Tiếc số tiền.", "Mong quán soi lại chất lượng."]],
    "wait": [["Giờ cao điểm đông ngoài sức tưởng tượng.", "Ghé buổi trưa, khách xếp hàng dài ra tận cửa hẻm.", "Gọi xong đứng đợi khá lâu."],
             ["Chờ gần mười lăm phút mới thấy nồi, một mình chủ quán xoay như chong chóng.", "Quán chỉ một người nấu nên đuối thấy rõ, bù lại nước lẩu vẫn đúng vị.", "Đợi lâu nước bay hơi nên mặn hơn mọi khi.", "Khách tiên hạc với khách tại bàn chen nhau, hơi rối.", "Lẩu ngon mà phải đợi, đứng mỏi cả chân.", "{mon} vẫn ngon, chỉ tội phải chờ."],
             ["Mong quán thêm người giờ cao điểm.", "Bớt sao vì phải chờ.", "Lần sau ghé giờ vắng vậy."]],
    "timeout": [["Đứng đợi mãi mà không tới lượt.", "Gọi món xong như bị quên.", "Quán đông mà không ai chia việc."],
                ["Gần hai mươi phút không thấy nồi đâu, đành đi về.", "Thấy đơn mình ghi trên bảng mà không ai đụng tới.", "Đứng muốn rã chân, cuối cùng phải tìm chỗ khác.", "Trễ giờ học nên không đợi nổi.", "Nhắc hai ba lượt mà chủ quán còn bận nồi khác.", "Người tới sau được làm trước, hơi bực thật.", "Hỏi thì được bảo chờ chút, rồi chút mãi."],
                ["Hụt hẫng, không ghé nữa.", "Mất toi thời gian.", "Lần sau chọn chỗ khác."]],
    "wrong": [["Đặt {mon} mà bưng ra nồi khác.", "Dặn không cay mà ăn vào cay xé lưỡi.", "Lộn sang đơn bàn bên.", "Căn dặn kỹ mà vẫn sai."],
              ["Đợi nấu lại thêm một chập.", "Topping lộn, độ cay cũng trật.", "Chủ quán xin lỗi liền mà vẫn mất vui."],
              ["Mong quán đọc đơn kỹ hơn.", "Bớt sao vì làm sai.", "Kỳ sau phải dặn hai lượt."]],
    "pricey": [["Giá hơi cao so với mặt bằng trong hẻm.", "Nồi {mon} tính tiền khá chát."],
               ["Vị ổn nhưng chưa tới mức giá đó.", "Nồi lớn mà nhỏ hơn mình tưởng, topping lại ít."],
               ["Lâu lâu mới dám ghé.", "Mong quán cân lại giá.", "Nhẹ hơn chút là ghé liền."]],
    "cheap": [["Tính ra quá hời cho một nồi đầy đặn.", "Vốn định tìm chỗ rẻ mà ngon, ai ngờ gặp {shop}."],
              ["Nồi {mon} lớn mà tiền nhẹ hơn nhiều chỗ, topping đầy.", "Sinh viên như mình tuần nào ăn cũng kham nổi."],
              ["Ủng hộ quán dài lâu.", "Kéo cả lớp tới ăn liền.", "Hời quá, năm sao tròn."]],
    "late": [["Đặt qua tiên hạc mà chờ dài cả buổi.", "Hạc báo phải đợi quán nấu xong mới đi."],
             ["Tới nơi lẩu nguội ngắt, nước chấm đổ lênh láng.", "Gần một tiếng mới nhận được nồi."],
             ["Lần sau đặt chỗ khác.", "Thôi không đặt nữa.", "Mong quán ưu tiên đơn hạc."]],
}


def viet(s):
    return bool(re.search(r"[àáảãạăằắẳẵặâầấẩẫậêềếểễệôồốổỗộơờớởỡợưừứửữựđ]", s, re.I))


def main():
    src = open(DATA, encoding="utf-8").read()
    goc = open(os.path.join(BASE, "_research/script_dom_245k.js"), encoding="utf-8").read()

    def thay(ten, moi, kieu="list"):
        nonlocal src
        pat = re.compile(r"(export const %s\s*=\s*)\(?[\[{].*?\n(?=/\*|export |\n\nexport |$)" % ten, re.S)
        if kieu == "list":
            body = "[\n    " + ",\n    ".join('"%s"' % x for x in moi) + "\n]"
        else:
            body = "[\n" + ",\n".join('  ' + repr(x).replace("'", '"') for x in moi) + "\n]"
        src2, n = pat.subn(lambda m: m.group(1) + body + "\n", src, count=1)
        print(f"  {ten}: {'đã thay' if n else 'KHÔNG KHỚP — kiểm tay'}")
        src = src2

    print("Thay kho tên:")
    thay("NM_NU", NM_NU)
    thay("NM_NAM", NM_NAM)
    thay("NM_BE", NM_BE)
    thay("NM_TIEN", NM_TIEN)
    thay("NM_TIEN_DANH", NM_TIEN_DANH)
    thay("NM_HO", NM_HO)

    print("Thay giọng gọi món:")
    src = re.sub(r"export const PERSONA\s*=\s*\[.*?\n\];", "export const PERSONA = " + fmt_obj(PERSONA) + ";", src, count=1, flags=re.S)
    src = re.sub(r"export const XPERSONA\s*=\s*\[.*?\n\];", "export const XPERSONA = " + fmt_obj(XPERSONA) + ";", src, count=1, flags=re.S)

    print("Thay bể review:")
    for ten, obj in (("TXT", TXT), ("PARTS", PARTS), ("LONG", LONG)):
        pat = re.compile(r"export const %s\s*=\s*\{.*?\n\};" % ten, re.S)
        src2, n = pat.subn("export const %s = %s;" % (ten, fmt_obj(obj)), src, count=1)
        print(f"  {ten}: {'đã thay' if n else 'KHÔNG KHỚP'}")
        src = src2

    open(DATA, "w", encoding="utf-8").write(src)
    print("\nĐã ghi", DATA)

    # kiểm tra không còn trùng với bản gốc
    miss = []
    for s in [x for v in TXT.values() for x in v] + [x for v in PARTS.values() for p in v for x in p] \
             + [x for v in LONG.values() for p in v for x in p] + NM_NU + NM_NAM + NM_BE + NM_TIEN + NM_TIEN_DANH:
        if s in goc:
            miss.append(s)
    print(f"\nChuỗi mới còn trùng với bản gốc: {len(miss)}")
    for s in miss[:20]:
        print("   •", s)


def fmt_obj(o, indent=0):
    sp = "  " * indent
    if isinstance(o, dict):
        return "{\n" + "".join(f"{sp}  {json_key(k)}: {fmt_obj(v, indent+1)},\n" for k, v in o.items()) + sp + "}"
    if isinstance(o, list):
        if all(isinstance(x, str) for x in o):
            return "[" + ", ".join(js_str(x) for x in o) + "]"
        return "[\n" + "".join(f"{sp}  {fmt_obj(x, indent+1)},\n" for x in o) + sp + "]"
    raise TypeError(type(o))


def json_key(k):
    return k if re.fullmatch(r"[A-Za-z_$][\w$]*", k) else js_str(k)


def js_str(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


if __name__ == "__main__":
    main()
