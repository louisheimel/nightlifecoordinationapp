'use strict';

(function() {
    
    document.addEventListener('click', function(e) {
        
        if (e.target.nodeName === 'A') {
            alert('anchor clicked!');
        }
    })
})();