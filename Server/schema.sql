#
# Encoding: Unicode (UTF-8)
#


CREATE TABLE `clients` (
  `id` varchar(37) NOT NULL DEFAULT '0',
  `last_seen` bigint(20) unsigned DEFAULT '0',
  `island` int(11) unsigned DEFAULT '0',
  `problem_id` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


CREATE TABLE `fitness_cases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `problem_id` varchar(128) DEFAULT NULL,
  `initializer` longtext,
  `ans` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=34 DEFAULT CHARSET=utf8;


CREATE TABLE `problems` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` tinytext NOT NULL,
  `comments` text,
  `fitness_test` longtext,
  `allowed` longtext,
  `evaluated_stack` varchar(128) NOT NULL DEFAULT '',
  `start_population` int(11) unsigned NOT NULL DEFAULT '0',
  `max_population` int(11) unsigned NOT NULL DEFAULT '0',
  `tournament_size` int(11) unsigned NOT NULL DEFAULT '0',
  `crossover_probability` int(11) unsigned NOT NULL DEFAULT '0',
  `mutation_probability` int(11) unsigned NOT NULL DEFAULT '0',
  `clone_probability` int(11) unsigned NOT NULL DEFAULT '0',
  `num_islands` int(11) unsigned DEFAULT '0',
  `num_programs_to_download` int(11) unsigned DEFAULT '0',
  `stagnant_generations` int(11) unsigned DEFAULT '0',
  `local_fetch_probability` int(11) unsigned DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;


CREATE TABLE `programs` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `problem` int(11) unsigned NOT NULL DEFAULT '0',
  `program_string` longtext NOT NULL,
  `fitness` int(11) NOT NULL DEFAULT '0',
  `island` int(11) unsigned NOT NULL DEFAULT '0',
  `client_id` varchar(33) NOT NULL DEFAULT '' COMMENT '	',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=1205 DEFAULT CHARSET=utf8;




