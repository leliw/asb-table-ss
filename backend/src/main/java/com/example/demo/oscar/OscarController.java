package com.example.demo.oscar;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.domain.Sort.Order;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OscarController {
	@Autowired
	private OscarRepository repository;
	
	@GetMapping("/api/oscars")
	public @ResponseBody Iterable<Oscar> getAll(
			@RequestParam(required = false) Integer pageNo, 
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(defaultValue = "id-asc") String[] sortBy) {
		
		List<Order> orders = new ArrayList<Order>();
		for (String sortOrder : sortBy) {
			String[] _sort = sortOrder.split("-");
			orders.add(new Order(getSortDirection(_sort[1]), _sort[0]));
		}
		if (pageNo != null)
			return  repository.findAll(PageRequest.of(pageNo, pageSize, Sort.by(orders)));
		else
			return repository.findAll(Sort.by(orders));
	}
	
	private Direction getSortDirection(String dir) {
		switch(dir) {
		case "asc":
		case "ASC":
			return Direction.ASC;
		case "desc":
		case "DESC":
			return Direction.DESC;
		default:
			return null;
		}
	}

	@GetMapping("/api/oscars/{Id}")
	public Oscar one(@PathVariable Integer Id) throws Exception {
		Oscar ret = this.repository.findById(Id)
				.orElseThrow(() -> new OscarNotFoundException(Id));
		return ret;
	}

	@PostMapping("/api/oscars")
	public Oscar newOne(@RequestBody Oscar item) {
		Oscar ret = this.repository.save(item);
		return ret;
	}
	
	@PutMapping("/api/oscars/{Id}")
	public Oscar replace(@RequestBody Oscar newItem, @PathVariable Integer Id)
			throws Exception {
		return repository.findById(Id).map(item -> {
			item.title = newItem.title;
			item.oscarYear = newItem.oscarYear;
			item.studio = newItem.studio;
			item.award = newItem.award;
			item.yearOfRelease = newItem.yearOfRelease;
			item.movieTime = newItem.movieTime;
			item.genre = newItem.genre;
			item.imdbRating = newItem.imdbRating;
			item.imdbVotes = newItem.imdbVotes;
			item.moveInfo = newItem.moveInfo;
			item.criticConsensus = newItem.criticConsensus;
			item.contenRating = newItem.contenRating;
			
			Oscar ret = repository.save(item);
			return ret;
		}).orElseGet(() -> {
			Oscar ret = repository.save(newItem);
			return ret;
		});
	}	

	@DeleteMapping("/api/oscars/{Id}")
	public void delete(@PathVariable Integer Id) {
		repository.deleteById(Id);
	}
}
