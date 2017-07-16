module.exports = angular
    .module('quarterlyReportComponent', [])
    .controller('quarterlyReportComponentCtrl', quarterlyReportComponentCtrl)
    .component('quarterlyReport', {
        templateUrl: 'tickers/quarterly-report/quarterly-report.tpl.html',
        controller:'quarterlyReportComponentCtrl',
        controllerAs: 'qr',
        bindings: {
            index: '<',
            medias: '<',
            report: '<',
            onDelete: '&',
            onRun: '&'
        }
    });
quarterlyReportComponentCtrl.$inject = ['$http'];

function quarterlyReportComponentCtrl ($http){
    this.save = (report, media_type) => {
        return $http.put('/app/api/tickers/periods/reports',{data:report.data},
            {
                params: {
                    report_id: report.id,
                    status:report.status ? Number(report.status) : 0,
                    media_type: media_type
                }
            })
            .then(res => !console.log(res.status) && true)
            .catch(err => !console.log(err) && true)
    };

    this.update = (report) => {
        this.report['status'] = !report.status;
    };

    this.select = (report, media) => {
      this.report.media_type = media;
    };

    this.delete = (report, index) => {
        return $http.delete('/app/api/tickers/periods/reports', {params:{report_id:report.id}})
            .then(res => {
                this.onDelete({index});
                return res;
            })
            .catch(err => !console.log(err) && true)
    };
    this.run = (report) => {
        this.onRun({report})
    };
    this.$onInit = () => {

        this.media_type = this.report.media_type ? this.report.media_type : 'twitter';
    };
}