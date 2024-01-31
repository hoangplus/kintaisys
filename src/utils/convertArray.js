import moment from 'moment';

// Func convert array split type list request
export const convertArrayList = (array) => {
  return array?.flatMap(item => {
    if (item.type === "2" && (item.status === 'pending' || item.status === 'approve')) {
      return [
        { date: item.date, type: "1" },
        { date: item.date, type: "0" }
      ];
    } else if (item.status === 'pending' || item.status === 'approve') {
      return [
        { date: item.date, type: item.type }
      ];
    }
    return [];
  });
};

// Func convert array split day list request
export const convertArraySplitDayList = (array) => {
  return array?.flatMap(item => {
    // Function to create an array of dates from a date range string
    const expandDateRange = (dateRange) => {
      const [startDate, endDate] = dateRange.split('-');
      const startMoment = moment(startDate, 'DD/MM/YYYY');
      const endMoment = moment(endDate, 'DD/MM/YYYY');
      const daysDifference = endMoment.diff(startMoment, 'days');
  
      return Array.from({ length: daysDifference + 1 }, (_, index) => {
        return { date: startMoment.clone().add(index, 'days').format('DD/MM/YYYY'), type: item.type };
      });
    };
  
    if (item.date.includes('-')) {
      // If the date is a range, expand it
      return expandDateRange(item.date);
    } else {
      // If it's a single date, return it as is
      return [{ date: item.date, type: item.type }];
    }
  });
};

// Func convert array split type modal request
export const convertArrayModal = (array) => {
  return array?.flatMap(item => {
    if (item.type === "2") {
      return [
        { date: item.date, type: "1" },
        { date: item.date, type: "0" }
      ];
    }
    return [
      { date: item.date, type: item.type }
    ];
  });
};

// Func convert array split day modal request
export const convertArraySplitDayModal = (array) => {
  return array?.flatMap(item => {
    // Function to create an array of dates from a date range string
    const expandDateRange = (dateRange) => {
      const [startDate, endDate] = dateRange.split('-');
      const startMoment = moment(startDate, 'DD/MM/YYYY');
      const endMoment = moment(endDate, 'DD/MM/YYYY');
      const daysDifference = endMoment.diff(startMoment, 'days');
  
      return Array.from({ length: daysDifference + 1 }, (_, index) => {
        return { date: startMoment.clone().add(index, 'days').format('DD/MM/YYYY'), type: item.type };
      });
    };
  
    if (item.date.includes('-')) {
      // If the date is a range, expand it
      return expandDateRange(item.date);
    } else {
      // If it's a single date, return it as is
      return [{ date: item.date, type: item.type }];
    }
  });
};

// Hàm để tính tổng số ngày trong khoảng từ startDate đến endDate (bao gồm cả endDate)
export const countWeekdays = (startDate, endDate, excludedDays) => {
  let currentDate = new Date(startDate);
  const targetDate = new Date(endDate);
  let count = 0;

  // Lặp qua từng ngày trong khoảng
  while (currentDate <= targetDate) {
    // Kiểm tra xem ngày hiện tại có phải là thứ 7 hoặc chủ nhật không
    const currentDay = currentDate.getDay();
    if (!excludedDays.includes(currentDay)) {
      count++;
    }

    // Tăng ngày hiện tại lên 1
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

// Func convert array split type modal request
export const mergeArraysByEmail = (array1, array2) => {
  const result = [];

  // Tạo một đối tượng để lưu trữ thông tin theo email
  const emailMap = {};

  // Lặp qua mảng thứ nhất và lưu thông tin vào emailMap
  array1.forEach((item) => {
    emailMap[item.email] = { ...item };
  });

  // Lặp qua mảng thứ hai, nếu có email trùng khớp thì merge thông tin
  array2.forEach((item) => {
    if (emailMap[item.email]) {
      // Merge thông tin từ cả hai mảng
      const mergedItem = { ...emailMap[item.email], ...item };
      result.push(mergedItem);
    }
  });

  return result;
};