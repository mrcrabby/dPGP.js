-- MySQL Administrator dump 1.4
--
-- ------------------------------------------------------
-- Server version	5.1.45


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


--
-- Create schema dpgpjs
--

CREATE DATABASE IF NOT EXISTS dpgpjs;
USE dpgpjs;

--
-- Definition of table `dpgpjs`.`fitness_cases`
--

DROP TABLE IF EXISTS `dpgpjs`.`fitness_cases`;
CREATE TABLE  `dpgpjs`.`fitness_cases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `problem_id` varchar(128) DEFAULT NULL,
  `initializer` longtext,
  `ans` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dpgpjs`.`fitness_cases`
--

/*!40000 ALTER TABLE `fitness_cases` DISABLE KEYS */;
LOCK TABLES `fitness_cases` WRITE;
INSERT INTO `dpgpjs`.`fitness_cases` VALUES  (22,'8','( 2 x INTEGER.DEFINE )','4'),
 (23,'8','( 3 x INTEGER.DEFINE )','6'),
 (24,'8','( 4 x INTEGER.DEFINE )','8'),
 (25,'8','( -1 x INTEGER.DEFINE )','-2'),
 (26,'8','( -2 x INTEGER.DEFINE )','-4'),
 (27,'8','( -3 x INTEGER.DEFINE )','-6');
UNLOCK TABLES;
/*!40000 ALTER TABLE `fitness_cases` ENABLE KEYS */;


--
-- Definition of table `dpgpjs`.`problems`
--

DROP TABLE IF EXISTS `dpgpjs`.`problems`;
CREATE TABLE  `dpgpjs`.`problems` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `fitness_test` longtext,
  `allowed` longtext,
  `evaluated_stack` varchar(128) NOT NULL DEFAULT '',
  `start_population` int(128) NOT NULL DEFAULT '0',
  `max_population` int(128) NOT NULL DEFAULT '0',
  `tournament_size` int(128) NOT NULL DEFAULT '0',
  `crossover_probability` int(128) NOT NULL DEFAULT '0',
  `mutation_probability` int(128) NOT NULL DEFAULT '0',
  `clone_probability` int(128) NOT NULL DEFAULT '0',
  `name` tinytext NOT NULL,
  `comments` text,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dpgpjs`.`problems`
--

/*!40000 ALTER TABLE `problems` DISABLE KEYS */;
LOCK TABLES `problems` WRITE;
INSERT INTO `dpgpjs`.`problems` VALUES  (8,NULL,NULL,'int',20,75,5,10,80,10,'Symbolic Regression Test','y=2x');
UNLOCK TABLES;
/*!40000 ALTER TABLE `problems` ENABLE KEYS */;


--
-- Definition of table `dpgpjs`.`programs`
--

DROP TABLE IF EXISTS `dpgpjs`.`programs`;
CREATE TABLE  `dpgpjs`.`programs` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `problem` int(11) unsigned NOT NULL DEFAULT '0',
  `program_string` longtext NOT NULL,
  `fitness` int(128) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dpgpjs`.`programs`
--

/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
LOCK TABLES `programs` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;


--
-- Definition of table `dpgpjs`.`test`
--

DROP TABLE IF EXISTS `dpgpjs`.`test`;
CREATE TABLE  `dpgpjs`.`test` (
  `id` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dpgpjs`.`test`
--

/*!40000 ALTER TABLE `test` DISABLE KEYS */;
LOCK TABLES `test` WRITE;
UNLOCK TABLES;
/*!40000 ALTER TABLE `test` ENABLE KEYS */;




/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
