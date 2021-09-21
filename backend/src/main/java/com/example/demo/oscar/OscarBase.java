package com.example.demo.oscar;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class OscarBase {
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
}
