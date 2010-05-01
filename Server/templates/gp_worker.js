importScripts('static/gp_worker_static.js','static/push.js','static/pushgp.js','static/gp_controller.js');

var cases = [
    
    {% for case in fitness_cases %}
        ["{{ case.initializer }}", {{ case.ans }} ],
    
    {% end %}
    
    ];