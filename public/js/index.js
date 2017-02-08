var uploader = angular.module( 'uploader', []);

uploader.controller( 'MainController', function( $scope, $http, $interval ) {

    $scope.last_refresh = 'Never';

    function refresh() {
        $http.get( '/api/folders' )
            .success(function( response ) {
                $scope.last_refresh = new Date().toString();
                $scope.servers = response;
            })
            .error(function( err ) {
                console.log( err );
            });
    }

    $scope.refresh_button = function() {
        refresh();
    };

    $scope.row_color = function( status ) {
        switch ( status ) {
            case 'running':
                return 'success';
            case 'stopped':
                return 'danger';
            case 'waiting':
                return 'warning';
            case 'done':
                return 'active';
            default:
                return 'success';
        }
    };

    $scope.spinner_status = function( status ) {
        switch ( status ) {
            case 'running':
                return 'fa fa-circle-o-notch fa-spin';
            case 'stopped':
                return 'fa fa-stop-circle';
            case 'waiting':
                return 'fa fa-pause';
            case 'done':
                return 'fa fa-check-circle-o';
            default:
                return 'fa fa-pause';
        }
    };

    $scope.fix_percent = function( percent ) {
        return ( typeof percent === 'string' ) ? percent : Math.ceil( percent ) + '%';
    };

    $scope.formatBytes = function( bytes, decimals ) {
        if ( bytes === 0 ) {
            return '0 Byte';
        } else if ( typeof bytes === 'string' || !bytes) {
            return 'N/A';
        }
        var k = 1000; // or 1024 for binary
        var dm = decimals + 1 || 3;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    $scope.formatBytesPerSecond = function (bytes, decimals) {
        if (bytes === 0) {
            return '0 Byte';
        } else if (typeof bytes === 'string' || !bytes) {
            return 'N/A';
        }
        var k = 1000; // or 1024 for binary
        var dm = decimals + 1 || 3;
        var sizes = ['(B/sec)', '(KB/sec)', '(MB/sec)', '(GB/sec)', '(TB/sec)', '(PB/sec)'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // created outside function so it can be removed
    var intervalPromise;

    function refresher() {
        // refresh every 10 seconds
        intervalPromise = $interval(function () {
            refresh();
        }, 10000);
    }




    // start the refresher
    refresher();
    // get initial data
    refresh();

    // stop refresher when the screen is changed
    $scope.$on('$destroy', function () {
        $interval.cancel(intervalPromise);
    });

});
