////////////////////////////////////////////////////////////////////////////////
/**
 * @name analyticsComponent
 * @namespace Components
 * @desc Component for the Analytics reporting View
 */

const moment = require('moment');
const humanDate = (epoch) => R.isNil(epoch) ? null: moment.unix(epoch).format('MM/DD/YYYY');

 module.exports = angular
    .module('analyticsComponent', ['tickertags-message-module'])
    .controller('AnalyticsCtrl', AnalyticsCtrl)
    .component('analyticsView', {
        templateUrl: 'analytics/analytics_view.html',
        controller: 'AnalyticsCtrl',
        controllerAs: 'an',
        transclude: true,
        bindings: {
            reports: '<'
        }
    })
     .filter('humanDate', function () {
         return (epoch) => humanDate(epoch)
     });

AnalyticsCtrl.$inject =[
    '$uibModal',
    'ApiFactory',
    'Message'];

function AnalyticsCtrl(
    $uibModal,
    ApiFactory,
    Message) {

    const mod = [
        'config',
        'correlation_score',
        'correlation_type',
        'current_mentions',
        'data_id',
        'frequency_pop',
        'frequency_yoy',
        'historical_periods',
        'kpi',
        'kpi_forecast',
        'name',
        'next_kpi_period_name',
        'next_kpi_report_date',
        'period_type',
        'report_period_type',
        'source',
        'start_epoch',
        'start_period',
        'start_year',
        'term',
        'term_id',
        'ticker',
        'kpi_estimate',
        'kpi_directional_indicator',
        'win_rate',
        'most_recent_report',
        'report_id'
    ];

    function save(term_id, config_id, data_id, report_id, data) {
        if (!term_id || !config_id || !data_id) {
            throw new Error('argument missing', arguments)
        }
        return ApiFactory
            .postWebReport(term_id, config_id, data_id, report_id, data)
            .catch(console.error)
    }
    function remove(term_id, config_id, data_id) {
        if (!term_id || !config_id || !data_id) {
            throw new Error('argument missing', arguments)
        }
        return ApiFactory.removeWebReport(term_id, config_id, data_id)
            .catch(console.error)
    }

    this.onSelect = (config) => {
        this.period_type = config.period_type;
        this.config = config;
        return ApiFactory.getPeriodData(config.id).then(res => {
            this.kpis = res.data.data;
            this.kpi  = this.kpis[0]
        })
    };

    this.removeWebReport = (report, index) => {
        return remove(report.term.id, report.config.id, report.kpi.id)
            .then(res =>{
                if (res.status === 400) {
                    return console.error(`Web report is not being published`);
                }
                this.reports.splice(index, 1);
            })
    };
    this.saveWebReport = () => {
        const data = R.pick(mod, this);
        return save(this.term.id, this.config.id, this.kpi.id, this.report_id, data)
            .then(Message.success(`Ticker Analytics Report Published.`))
            .catch(error => Message.failure(`Error trying to Publish Ticker Analytics Report. Error [${error.status}]`))
    };

    this.setCurrent = (report, index) => {
        R.keys(R.omit(['kpi', 'correlation_type'],report))
            .filter(key => R.has(key, this) && !R.isEmpty(report.key))
            .forEach(key => this[key] = report[key]);
        this.config = report.config;
        this.ticker = report.config.ticker;
        this.term = report.term;
        this.kpi = report.kpi;
        this.kpis = [this.kpi];
        this.currentIndex = index;
    };

    this.selectTerm = (term) => {
        this.term = term;
    };

    this.getTerms = (text) => {
        // console.log(text);
        return this.ticker ? ApiFactory
                .tsearch(this.ticker, text).then((data) => {
            console.log(data);
            return data;
        })
            : Promise.resolve([]);
    };

    this.getMatches = (text) => {
        // console.log(text);
        return ApiFactory.getPeriodConfigs( text).then((res) => {
            return res.data.configs;
        });
    };
    this.reset = () => this.$onInit();

    this.runWebAnalytics = () => {
        this.correlation_score = null;
        this.current_mentions = null;
        this.frequency_pop = null;
        this.frequency_yoy = null;
        this.historical_periods = null;
        this.kpi_forecast = null;
        this.next_kpi_report_date = null;
        this.next_kpi_period_name = null;

        if (!this.term || !this.config || !this.kpi) {

            return Promise.reject(Message.failure('Ticker, Term or KPI was not selected'));
        }

        $uibModal.open({
            template:'<div><div class="admin-modal"> Running Web Report</div><div class="overlay"></div></div>',
            windowClass: 'tags-modal',
            resolve:{
                term: () => this.term,
                config: () => this.config,
                kpi: () => this.kpi,
                report_period_type: () => this.report_period_type
            },
            bindToController: true,
            controller: function(term, config, kpi, report_period_type, $uibModalInstance) {
                ApiFactory.runWebAnalytics(term.id, config.id,kpi.id, report_period_type)
                    .then($uibModalInstance.close)
                    .catch($uibModalInstance.dismiss)
            }
        })
            .result.then(res =>{
                const web_report = res.data;
                this.correlation_score = web_report.correlation_score;
                this.current_mentions = web_report.current_mentions;
                this.frequency_pop = web_report.frequency_pop;
                this.frequency_yoy = web_report.frequency_yoy;
                this.historical_periods = web_report.historical_periods;
                this.kpi_forecast = web_report.kpi_forecast;
                this.next_kpi_report_date = humanDate(web_report.next_kpi_report_date);
                this.next_kpi_period_name = web_report.next_kpi_period_name;
                this.most_recent_report = humanDate(moment().unix());
            })
    };

    const directionalIndicator = (estimate, projection) => {
        if (R.isNil(estimate) || R.isNil(projection)) {
            return null;
        }
        const line = Math.round(Math.sqrt(Math.pow(estimate/projection - 1, 2)) * 100);
        if (line < 5) {
            return 'In Line'
        }
        else {
            return projection > estimate ? 'Beat' : 'Miss';
        }
    };
    this.indicator = (estimate, projection) => this.kpi_directional_indicator = directionalIndicator(estimate, projection);

    this.$onInit = () => {
        this.ticker = null;
        this.term = {id:null, term:null};
        this.period_type = null;
        this.config = null;
        this.data_source = 'Twitter';
        this.kpis = [];
        this.kpi = {name:'kpi'};
        this.correlations = ['linear', 'poly'];
        this.report_period_types = ['pop', 'yoy'];
        this.report_period_type = this.report_period_types[0];
        this.correlation_type = this.correlations[0];
        this.report = null;
        this.correlation_score = null;
        this.current_mentions = null;
        this.frequency_pop = null;
        this.frequency_yoy = null;
        this.historical_periods = null;
        this.kpi_forecast = null;
        this.kpi_estimate = null;
        this.kpi_directional_indicator = null;
        this.win_rate = null;
        this.most_recent_report = null;
        this.next_kpi_report_date = null;
        this.next_kpi_period_name = null;
        this.currentIndex = null;
        this.report_id = null;
    };
}
