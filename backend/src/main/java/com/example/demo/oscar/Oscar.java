package com.example.demo.oscar;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "oscars")
public class Oscar {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Integer id;
	public String title;
	public String oscarYear;
	public String studio;
	public String award;
	public Integer yearOfRelease;
	public Integer movieTime;
	public String genre;
	public Double imdbRating;
	public Integer imdbVotes;
	public String moveInfo;
	public String criticConsensus;
	public String contenRating;
}
