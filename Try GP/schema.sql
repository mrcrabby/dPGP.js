#
# Encoding: Unicode (UTF-8)
#


CREATE TABLE `fitness_cases` (
  `id` int(11) DEFAULT NULL,
  `problem_id` varchar(128) DEFAULT NULL,
  `initializer` longtext
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


CREATE TABLE `problems` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `fitness_test` longtext NOT NULL,
  `allowed` longtext NOT NULL,
  `evaluated_stack` varchar(128) NOT NULL DEFAULT '',
  `start_population` int(128) NOT NULL DEFAULT '0',
  `max_population` int(128) NOT NULL DEFAULT '0',
  `tournament_size` int(128) NOT NULL DEFAULT '0',
  `crossover_percentile` int(128) NOT NULL DEFAULT '0',
  `mutation_probability` int(128) NOT NULL DEFAULT '0',
  `clone_probability` int(128) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;


CREATE TABLE `programs` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `problem` int(11) unsigned NOT NULL DEFAULT '0',
  `program_string` longtext NOT NULL,
  `fitness` int(128) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;




