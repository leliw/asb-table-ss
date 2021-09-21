package com.example.demo.oscar;

import javax.persistence.Entity;
import javax.persistence.Table;

@Entity(name = "Oscar")
@Table(name = "oscars")
public class Oscar extends OscarBase {
	public Double imdbRating;
	public Integer imdbVotes;
	public String moveInfo;
	public String criticConsensus;
	public String contenRating;
}
