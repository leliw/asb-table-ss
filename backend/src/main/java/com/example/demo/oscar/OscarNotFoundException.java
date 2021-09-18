package com.example.demo.oscar;

@SuppressWarnings("serial")
public class OscarNotFoundException extends Exception {
	public OscarNotFoundException(Integer id) {
		super("Could not find Oscar " + id);
	}
}
