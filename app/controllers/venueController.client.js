'use strict';

(function() {
    // get the count for each venue count
      // check howManyGoing for this venue -> append this to the first child of the link (i.e. the span)
    (function() {
        document.querySelectorAll('.venue_count').forEach(function(venue) {
            ajaxFunctions.ajaxRequest('GET', '/api/' + venue.dataset.id + '/count',function(data) {
                venue.childNodes[0].textContent = data;
            });
        })
    })();



    
    document.addEventListener('click', function(e) {
        
        if (e.target.nodeName === 'A' && !e.target.classList.toString().split(' ').includes('action')) {
            e.preventDefault();
            // get the venue corresponding to the data-id property of this link
            // if user is attending this venue already, remove them from the venue
            // else, add them to the venue
            ajaxFunctions.ajaxRequest('GET', '/api/' + e.target.dataset.id + '/click', function(data) {
                e.target.childNodes[0].textContent = data;
            });
        }
    });
})();