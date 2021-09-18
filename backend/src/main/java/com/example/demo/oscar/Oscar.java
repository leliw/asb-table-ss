package com.example.demo.oscar;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "oscars")
public class Oscar {
	@Id
	public Integer id;
	public String title;
	public String oscarYear;
	public String studio;
	public String award;
	public Integer yearOfRelease;
	public Integer movieTime;
	public String genre;
}
