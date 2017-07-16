////////////////////////////////////////////////////////////////////////////////
/**
 * @name quarterlyReportsDirective
 * @namespace Directive
 * @desc Element directive and Controller for the Tags View
 */

const quarterlyReportsDirective = angular
    .module('quarterlyReportsDirective', [])
    .controller('QuarterlyReportsCtrl', QuarterlyReportsCtrl)
    .directive('quarterlyReportsView', quarterlyReportsView);

function quarterlyReportsView() {
    return {
        templateUrl      : "tickers/quarterly_reports.html",
        restrict         : 'E',
        replace          : true,
        bindToController : true,
        controller       : QuarterlyReportsCtrl,
        controllerAs     : 'qrc',
        scope            : {}
    };
}

QuarterlyReportsCtrl.$inject = [
    '$scope',
    '$http',
    '$location',
    'ApiFactory'
];

function QuarterlyReportsCtrl (
    $scope,
    $http,
    $location,
    ApiFactory) {

    // Variables ///////////////////////////////////////////////////////////////
    const vm = this;
          vm.headerTitle = 'Ticker Quarterly Reports';
          vm.ticker_reports = [];
          vm.ticker_period_config_id = 0;


    // Function expressions ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////
    /**
     * Initialization function of the quarterlyReportsDirective Controller
     * @function
     */

    this.medias = ['twitter', 'news', 'blog', 'board', 'review', 'video_comment', 'financial'];

    this.selectMedia = (report) => {
        ApiFactory.selectReportMedia(report);
    };

    const displayNotification = (status, message) => {
        $scope.$emit("display.notification", message, status, 3000);
    };

    const populatePeriodData = (ticker_period_config_id, option, res) => {
       ApiFactory.getPeriodData(ticker_period_config_id).then(data => {
           vm.ticker_period_data = data.data.data;

           if (option === 'notify') displayNotification(res.data.status, 'Quarterly data submitted!');
       });
    };

    const addConfig = (config) => {
        config.start_epoch = getEpoch(config.start_date);
        const digits = config.start_date.split('');
        if (digits.length == 8) {
            const year = parseInt(digits.slice(0,4).join(''));
            const month = parseInt(digits.slice(4,6).join('')) - 1;
            const day = parseInt(digits.slice(6,8).join(''));

            if (config.period_type == 'yearly') {
                config.start_period = 1
                config.start_year = year 
            } else if (config.period_type == 'monthly') {
                config.start_period = month
                config.start_year = year 
            } else if (config.period_type == 'weekly') {
                config.start_year = year 
            } else if (config.period_type == 'biweekly') {
                config.start_year = year 
            }
        }

        var original = 1;

        for (var i=0;i<vm.ticker_configs.length;i++) {
            if (config.name === vm.ticker_configs[i].name) {
                original = 0;
            }
            if (config.start_epoch === vm.ticker_configs[i].start_epoch && config.period_type == vm.ticker_configs[i].period_type) {
                original = 0;
            }
        }

        if (original) {
            ApiFactory.postPeriodsConfig(vm.ticker, { 'config': config }).then( data => {
                vm.new_config = {
                    'name': vm.ticker + ' quarterly',
                    'period_type': 'quarterly',
                    'start_date': '20120101',
                    'start_year': 2012,
                    'start_period': 2
                };
                loadQuarterlyReports();
            });
        } else {
           displayNotification('failure', 'Duplicate Config Found - Try Again');
        }
    };

    const loadReportData = (config_id) => {
        // console.log('loadReportData config_id', config_id)
        vm.ticker_period_config_id = config_id;
        ApiFactory.getPeriods(vm.ticker_period_config_id).then(data => {
            vm.ticker_periods = data.data.periods;
            for (var i=0; i<vm.ticker_periods.length; i++) {
                vm.ticker_periods[i].end_date   = formatEpoch(vm.ticker_periods[i].end_epoch);
                vm.ticker_periods[i].start_date = formatEpoch(vm.ticker_periods[i].start_epoch);
                vm.ticker_periods[i].repr = `${vm.ticker_periods[i].year}Q${vm.ticker_periods[i].period}`;
            }
            // console.log(vm.ticker_periods);
            vm.new_period_data = {
                'id': '',
                'ticker_period_config_id': vm.ticker_period_config_id,
                'name': '',
                'data_type': 'dollars',
                'periods': data.data.periods,
            };
            populatePeriodData(vm.ticker_period_config_id);
        });

        ApiFactory.getTickerPeriodReports(vm.ticker_period_config_id).then(data => {
            vm.ticker_reports = data.data.reports;
            console.log('vm.ticker_reports', vm.ticker_reports);
        });
    };

    const loadQuarterlyReports = () => {
        const ticker = $location.search().ticker;
        vm.ticker = ticker;
        vm.new_config = {
            'name': ticker + ' quarterly',
            'period_type': 'quarterly',
            'start_date': '20120101',
            'start_year': 2012,
            'start_period': 2
        };

        console.log('vm.new_config', vm.new_config)

        ApiFactory.getPeriodConfigs(ticker).then(data => {
            console.log('ApiFactory.getPeriodConfigs data', data)
            vm.ticker_configs = data.data.configs;
            for (var i=0;i<vm.ticker_configs.length;i++) {
                vm.ticker_configs[i].id = vm.ticker_configs[i].id.toString();
            }
            if (vm.ticker_configs.length > 0) {
                loadReportData(vm.ticker_configs[0].id);
            }
        });
    };

    const invalidPeriod = (repr) => R.not(String(repr).includes('Q'));

    const saveTickerPeriods = (ticker_periods) => {
        const anyInvalid = ticker_periods.map((period) => {
            const invalid = invalidPeriod(period.repr);
            period.invalid = invalid;
            return invalid;
        });
        if (R.any(R.equals(true), anyInvalid)) {
            return console.log('Invalid Dates');
        }
        else {
            const updatedPeriods = ticker_periods.map(ticker_period => {
                let [year, period] = ticker_period.repr.split('Q');
                let start_epoch = ticker_period.start_epoch;
                let end_epoch = ticker_period.end_epoch;
                return {year, period, start_epoch, end_epoch}
            });
            return ApiFactory.updatePeriods(vm.ticker_period_config_id, updatedPeriods)
        }
    };

    const setEpoch = (date, epoch, index, end) => {
        const digits = date.split('');
        if (digits.length == 8) {
            const year = parseInt(digits.slice(0,4).join(''));
            const month = parseInt(digits.slice(4,6).join('')) - 1;
            const day = parseInt(digits.slice(6,8).join(''));
            const milliseconds = Date.UTC(year, month, day);
            epoch = milliseconds / 1000;
            if (end) {
                epoch += 24*60*60-1;
                vm.ticker_periods[index].end_epoch = epoch;
            } else {
                vm.ticker_periods[index].start_epoch = epoch;
            }
            ApiFactory.putPeriods(vm.ticker_periods[index].ticker_period_config_id, vm.ticker_periods[index].year, vm.ticker_periods[index].period, { 'start_epoch': vm.ticker_periods[index].start_epoch, 'end_epoch': vm.ticker_periods[index].end_epoch });
            if (end && index != vm.ticker_periods.length -1) {
                vm.ticker_periods[index + 1].start_epoch = epoch + 1;
                vm.ticker_periods[index + 1].start_date = formatEpoch(vm.ticker_periods[index + 1].start_epoch);
                ApiFactory.putPeriods(vm.ticker_periods[index + 1].ticker_period_config_id, vm.ticker_periods[index + 1].year, vm.ticker_periods[index + 1].period, { 'start_epoch': vm.ticker_periods[index + 1].start_epoch, 'end_epoch': vm.ticker_periods[index + 1].end_epoch });
            }
            if (!end && index != 0) {
                vm.ticker_periods[index - 1].end_epoch = epoch - 1;
                vm.ticker_periods[index - 1].end_date = formatEpoch(vm.ticker_periods[index - 1].end_epoch);
                ApiFactory.putPeriods(vm.ticker_periods[index - 1].ticker_period_config_id, vm.ticker_periods[index - 1].year, vm.ticker_periods[index - 1].period, { 'start_epoch': vm.ticker_periods[index - 1].start_epoch, 'end_epoch': vm.ticker_periods[index - 1].end_epoch });
            }
        }
        return epoch;
    };

    const getEpoch = (date) => {
        const digits = date.split('');
        var epoch = 0;
        if (digits.length == 8) {
            const year = parseInt(digits.slice(0,4).join(''));
            const month = parseInt(digits.slice(4,6).join('')) - 1;
            const day = parseInt(digits.slice(6,8).join(''));
            const milliseconds = Date.UTC(year, month, day);
            epoch = milliseconds / 1000;
        }

        return epoch;
    };

    const formatEpoch = (epoch) => {
        const date = new Date(epoch * 1000);
        let y = date.getUTCFullYear();
        let m = date.getUTCMonth() + 1;
        let d = date.getUTCDate();
        y = y.toString();
        if (m < 10) {
            m = '0' + m.toString();
        } else {
            m = m.toString();
        }
        if (d < 10) {
            d = '0' + d.toString();
        } else {
            d = d.toString();
        }
        return y + m + d;
    };

    Date.prototype.yyyymmdd = function() {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();

        return [this.getFullYear(), !mm[1] && '0', mm, !dd[1] && '0', dd].join(''); // padding
    };

    const runQuarterlyReport = (report) => {
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const date = new Date();
        const date_string = date.yyyymmdd();
        let text = "";
        let ticker = vm.ticker;
        ticker = ticker.replace('/','');
        ticker = ticker.replace('-','');

        for (let i=0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return $http.get('/app/api/tickers/periods/report/' + ticker + '-quarterly-report-' + date_string  + '-' + text + '.xlsx?report_id=' + report.id)
            .then((quarterlyReports) => {
                console.log('runQuarterlyReport', quarterlyReports);
                window.open('/app/api/tickers/periods/report/' + ticker + '-quarterly-report-' + date_string  + '-' + text + '.xlsx?report_id=' + report.id);
        })


    };

    const deleteQuartersData = (data) => {
        ApiFactory.deletePeriodsData(data.id).then( delete_data => {
            populatePeriodData(data.ticker_period_config_id);
        });
    };

    const updateReport = (report) => {
        ApiFactory.putTickerPeriodReport(report.id, report).then(data => {
            // console.log(vm.ticker_reports);
        });
    };

    const createReport = (ticker_period_config_id) => {
        let post_data = { 'ticker_period_config_id': ticker_period_config_id, 'data': { 'term_ids': [], 'terms': [], 'data_id': null, 'report_period': 'pop' } };
        ApiFactory.postTickerPeriodReport(post_data).then( data => {
            // console.log(data);
            vm.ticker_reports.push({ 'ticker_period_config_id': ticker_period_config_id, 'id': data.data.report_id, 'data': { 'term_ids': [], 'terms': [], 'data_id': null, 'report_period': 'pop' } });
            // console.log(vm.ticker_reports);
        });
    };

    const toggleReportReportPeriod = (report, period) => {
        report.data.report_period = period;
        ApiFactory.putTickerPeriodReport(report.id, report);
    };

    const toggleReportDataPoint = (report, data_point_id) => {
        // console.log(data_point_id);
        report.data.data_id = data_point_id;
        ApiFactory.putTickerPeriodReport(report.id, report);
    };

    const removeReportTermId = (report, term_id) => {
        const index = report.data.term_ids.indexOf(term_id);
        if (index !== -1) {
            report.data.term_ids.splice(index, 1);
            report.data.terms.splice(index, 1);
        }
        report.selected = '';
        ApiFactory.putTickerPeriodReport(report.id, report);
    };

    const addReportTermId = (report, item) => {
        const index = report.data.term_ids.indexOf(item.term_id);
        if (index === -1) {
            report.data.term_ids.push(item.term_id);
            report.data.terms.push({ 'term': item.term, 'id': item.term_id });
        }
        report.selected = '';
        ApiFactory.putTickerPeriodReport(report.id, report);
    };

    const getMatches = (text) => {
        // console.log(text);
        return ApiFactory.tsearch(vm.ticker, text).then((data) => {
            // console.log(data);
            return data;
        });
    };

    const saveQuartersData = (data, clear) => {
        // console.log(data);

        const periods = [];
        for (var i=0; i<data.periods.length; i++) {
            periods.push({
                'year': data.periods[i].year,
                'period': data.periods[i].period,
                'value': parseFloat(data.periods[i].value) || 0
            });
        }

        // console.log(periods);
        const ticker = data.ticker;
        ApiFactory.postPeriodsData(data.ticker_period_config_id, data.id, { 'name': data.name, 'data_type': data.data_type, 'periods': periods }).then((res) => {
            if (clear) {
                for (var i=0;i<vm.ticker_periods.length;i++) {
                    delete vm.ticker_periods[i]['value'];
                }

                vm.new_period_data = {
                    'id': '',
                    'name': '',
                    'data_type': 'dollars',
                    'periods': vm.ticker_periods,
                    'ticker_period_config_id': data.ticker_period_config_id
                };

                populatePeriodData(data.ticker_period_config_id, 'notify', res);
            }
            else {
               displayNotification(res.data.status, 'Quarterly data submitted!');
            }
        });
    };
    const deleteReport = (index) => {
        vm.ticker_reports.splice(index, 1);
    };

    loadQuarterlyReports();

    // Hoisted functions ///////////////////////////////////////////////////////
    vm.loadQuarterlyReports = loadQuarterlyReports;
    vm.saveQuartersData = saveQuartersData;
    vm.deleteQuartersData = deleteQuartersData;
    vm.runQuarterlyReport = runQuarterlyReport;
    vm.createReport = createReport;
    vm.updateReport = updateReport;
    vm.getMatches = getMatches;
    vm.addReportTermId = addReportTermId;
    vm.removeReportTermId = removeReportTermId;
    vm.toggleReportDataPoint = toggleReportDataPoint;
    vm.toggleReportReportPeriod = toggleReportReportPeriod;
    vm.setEpoch = setEpoch;
    vm.addConfig = addConfig;
    vm.loadReportData = loadReportData;
    vm.deleteReport = deleteReport;
    vm.changeTickerPeriod = invalidPeriod;
    vm.saveTickerPeriods = saveTickerPeriods;
}

module.exports = quarterlyReportsDirective;
