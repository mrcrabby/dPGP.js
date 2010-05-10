importScripts('static/gp_worker_static.js','static/push.js','static/pushgp.js','static/gp_controller.js');

var cases = [
    
    {% for case in fitness_cases %}
        ["{{ case.initializer }}", {{ case.ans }} ],
    
    {% end %}
    
    ];

var gp_params = {
        'crossoverPercentile' : {{ gp_params.crossover_probability }},
        'mutationProbability' : {{ gp_params.mutation_probability }},
		'cloneProbability' : {{ gp_params.clone_probability }},
        'startPopulation' : {{ gp_params.start_population }},
        'tournamentSize' : {{ gp_params.tournament_size }},
        'maxPopulation' : {{ gp_params.max_population }},
        'stagnantGenerations' : {{ gp_params.stagnant_generations }},
        'numProgramsToDownload' : {{ gp_params.num_programs_to_download }}
    };

var pushScriptFuncs = {{ gp_params.allowed }};