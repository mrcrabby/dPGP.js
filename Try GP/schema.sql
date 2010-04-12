#
# Encoding: Unicode (UTF-8)
#


CREATE TABLE `problems` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `fitness_test` longtext,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


CREATE TABLE `programs` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `problem` int(11) unsigned NOT NULL DEFAULT '0',
  `program_string` longtext NOT NULL,
  `fitness` int(128) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;




